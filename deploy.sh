#!/bin/bash
if ! command -v jq &> /dev/null
then
    echo "jq could not be found and will be installed next..."
    sudo yum install jq -y
fi
echo "Cloning repo..."
echo ""
git clone https://github.com/aws-samples/amazon-workspaces-demo.git
echo "Changing directories to amazon-workspaces-demo..."
echo ""
cd amazon-workspaces-demo
echo "NPM update, install and build..."
echo ""
npm update
npm install
npm oudated
npm update
npm run build
echo "Deploy CDK Stack..."
echo ""
cdk bootstrap
cdk deploy --outputs-file outputs.json
echo "Reading CDK outputs..."
echo ""
corpDCPassword=$(aws secretsmanager get-secret-value --secret-id aws-workspaces-demo-adminpassword | jq -r '.SecretString')
directoryID=$(cat outputs.json | jq -r '.WorkspacesDemoStack.directoryId')
directoryIP=$(cat outputs.json | jq -r '.WorkspacesDemoStack.directoryIP')
directoryIP2=$(cat outputs.json | jq -r '.WorkspacesDemoStack.directoryIP2')
directorySG=$(aws ds describe-directories --directory-ids $directoryID | jq -r '.DirectoryDescriptions[].VpcSettings.SecurityGroupId')
DCSG=$(cat outputs.json| jq -r '.WorkspacesDemoStack.corpDCSG')
DCInstanceId=$(cat outputs.json| jq -r '.WorkspacesDemoStack.DCInstanceId')
DCInstanceIp=$(cat outputs.json| jq -r '.WorkspacesDemoStack.corpDCPrivateIp')
Region=$(cat outputs.json| jq -r '.WorkspacesDemoStack.Region')
echo "Adding Managed Directory Security Group Rule..."
echo ""
aws ec2 authorize-security-group-egress --group-id $directorySG --protocol all --port all --cidr 0.0.0.0/0
echo "Registering directory with Workspaces..."
echo ""
aws workspaces register-workspace-directory --directory-id $directoryID --no-enable-work-docs
echo "CDK stack deployment complete, please configure the trust:"
echo ""
echo ""
read -p "What is your public IP? (check https://checkip.amazonaws.com/ from your browser): " publicIp
echo "Adding ingress rule from your IP ($publicIp) to port 3389..."
echo ""
# TODO: Check input is a valid IP and not 0/0
aws ec2 authorize-security-group-ingress --group-id $DCSG --port 3389 --protocol tcp --cidr "$publicIp/32"
echo "Open the EC2 console from the following link and connect to the instance using an RDP client and the following credentials: "
echo ""
echo "https://console.aws.amazon.com/ec2/home?region=$Region#ConnectToInstance:instanceId=$DCInstanceId"
echo "User: Administrator"
echo ""
echo "Password: "
echo ""
echo $(aws secretsmanager get-secret-value --secret-id aws-workspaces-demo-adminpassword | jq -r '.SecretString')
echo ""
echo "Open the Powershell CLI and execute this command to create the Conditional Forwarders to aws-corp.example.com:"
echo ""
echo "Add-DnsServerConditionalForwarderZone -Name aws-corp.example.com -MasterServers $directoryIP,$directoryIP2 -ReplicationScope Forest"
echo ""
echo "Open AD Domains and Trusts and create a two-way forest trust to aws-corp.example.com"
echo ""
echo ""
read -p "What the password did you use for the TRUST?: " trustpassword
echo "Creating the trust in Managed Active Directory..."
echo ""
echo ""
aws ds create-trust --directory-id $directoryID --trust-password $trustpassword --remote-domain-name corp.example.com --trust-direction Two-Way --trust-type Forest --conditional-forwarder-ip-addrs $DCInstanceIp
echo "Enviroment deployment completed! "
echo "After 10-20 minutes the trust is verified and you can launch Workspaces for users in corp.example.com"
echo ""




