import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as mad from '@aws-cdk/aws-directoryservice';
import * as wks from '@aws-cdk/aws-workspaces';
import * as iam from '@aws-cdk/aws-iam';
import { CfnRoute, InstanceSize } from '@aws-cdk/aws-ec2';
import { CfnOutput, Stack } from '@aws-cdk/core';
import { version } from 'process';
import { isMainThread } from 'worker_threads';
import { ManagedPolicy, Policy, Role } from '@aws-cdk/aws-iam';
import { profile } from 'console';
import { appendFile } from 'fs';


export class WorkspacesDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const vpc = new ec2.Vpc(this, 'WorkspacesDemoVPC', {
      cidr: "10.42.0.0/16",
      maxAzs: 2,
      natGateways: 1,
    });

    const vpcPrivateSubnets = vpc.privateSubnets.slice(0,2).map(x => x.subnetId);

    const MADSecret = new sm.Secret(this, 'aws-corp.example.com' + '_credentials', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        generateStringKey: 'password'
      },
    });

    const ADSecret = new sm.Secret(this, 'corp.example.com', {
      secretName: 'aws-workspaces-demo-adminpassword',
      generateSecretString: {
        passwordLength: 14,
      },
    });

    const DCInstanceSG = new ec2.SecurityGroup(this, 'DCInstanceSG', {
      vpc: vpc,
      allowAllOutbound: true,
    });

    DCInstanceSG.addIngressRule(ec2.Peer.ipv4('10.42.0.0/8'), ec2.Port.allTraffic());

    const DCInstanceRole = new iam.Role(this, 'DCInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });

    DCInstanceRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
    DCInstanceRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'));

    const DCInstance = new ec2.Instance(this, 'WorkspacesDemoDCInstance', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
      machineImage: ec2.MachineImage.latestWindows(ec2.WindowsVersion.WINDOWS_SERVER_2019_ENGLISH_FULL_BASE),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: DCInstanceSG,
      role: DCInstanceRole,
    });

    DCInstance.userData.addCommands(
      'curl https://awscli.amazonaws.com/AWSCLIV2.msi -OutFile c:\\awscli.msi',
      'Start-Process -Wait -FilePath msiexec -ArgumentList /i, "c:\\awscli.msi", /qn, /l*v, "install.log"',
      '$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")',
      '$password = aws secretsmanager get-secret-value --secret-id aws-workspaces-demo-adminpassword  --query SecretString',
      `net user Administrator $password /Y`,
      'Install-WindowsFeature AD-Domain-Services -IncludeManagementTools',
      `Install-ADDSForest -DomainName corp.example.com -Confirm:$false -SafeModeAdministratorPassword (ConvertTo-SecureString -AsPlainText $password -Force)`
      );

      const directory = new mad.CfnMicrosoftAD(this, 'WorkspacesDemoDirectory', {
        name: "aws-corp.example.com",
        vpcSettings: {
          vpcId: vpc.vpcId,
          subnetIds: vpcPrivateSubnets
        },
        password: MADSecret.secretValueFromJson('password').toString()
       });

    const directoryIP = cdk.Fn.select(0, directory.attrDnsIpAddresses); 
    new CfnOutput(this, 'directoryIP', {
      value: directoryIP
    });

    const directoryIP2 = cdk.Fn.select(1, directory.attrDnsIpAddresses); 
    new CfnOutput(this, 'directoryIP2', {
      value: directoryIP2
    });

    new CfnOutput(this, 'directoryId', {
      value: directory.attrAlias
    });

    new CfnOutput(this, 'corpDCPublicIp', {
      value: DCInstance.instancePublicIp
    });

    new CfnOutput(this, 'corpDCPrivateIp', {
      value: DCInstance.instancePrivateIp
    });

    new CfnOutput(this, 'corpDCSG', {
      value: DCInstanceSG.securityGroupId
    });

    new CfnOutput(this, 'DCInstanceId', {
      value: DCInstance.instanceId
    });

    new CfnOutput(this, 'Region', {
      value: this.region
    });
    

  }}
