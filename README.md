# Amazon Workspaces Demo

## Requirements

* AWS Account
* [Remote Desktop Client](https://docs.microsoft.com/en-us/windows-server/remote/remote-desktop-services/clients/remote-desktop-clients)

## Architecture

![Architecture](img/architecture.svg)
## Getting Started

We recommend deploying this demo environment to the closest AWS Region where Workspaces is available, the latest list can be found [here](https://docs.aws.amazon.com/workspaces/latest/adminguide/azs-workspaces.html).

Create a [new Cloud9 Environment](https://console.aws.amazon.com/cloud9/home) in your preferred region from the list above.
![Launch Cloud9](img/launch-cloud9-name.png)

When configuring the Cloud9 environment, select the default options (Create a new EC2 instance with direct access, t2.micro, Amazon Linux 2)
![Configure Cloud9](img/configure-cloud9-settings.png)

We will be using the Cloud9 terminal to deploy the demo resources, you can maximize the terminal window to have a larger view:
![Maximize Cloud9 terminal](img/max-cloud9-terminal.png)

To start the deployment, execute the following command in your Cloud9 terminal:
```
bash <(curl -s https://raw.githubusercontent.com/aws-samples/amazon-workspaces-demo/main/deploy.sh)
```

The AWS::DirectoryService::MicrosoftAD deployment will take 30-40 minutes, **DO NOT close** the Cloud9 terminal during this time.

After the resources are created, you will need to provide your public IP address for the script to add a Security Group Rule for RDP access. You can view your current IP address from [https://checkip.amazonaws.com/](https://checkip.amazonaws.com/).

To create the trust from your corp.example.com to the aws-corp.example AWS Managed Directory download the RDP file from the EC2 console as instructed and login to the EC2 Domain Controller as Administrator with the secure password provided in the terminal. (You can also retrieve the password from Secrets Manager).

From the Windows Domain Controller, open Powershell CLI and create the DNS Conditional Forwarders with the command provided in the terminal, for example:
```
Add-DnsServerConditionalForwarderZone -Name aws-corp.example.com -MasterServers x.x.x.x,x.x.x.x -ReplicationScope Forest
```
![Conditional Forwarders](img/create-conditional-forwarders.png)

From the Windows Start Menu, open Active Directory Domains and Trusts:

![Open Trust](img/open-trusts.png)

Right click over ```corp.example.com``` and select Properties:

![Open Trust Properties](img/open-trust-properties.png)

Click the Trusts tab and select New Trust:

![New trust](img/new-trust.png)

Click Next. For Trust Name enter ```aws-corp.example.com``` and click next.

![Trust Name](img/trust-name.png)

For Trust Type, select Forest Trust and click next.

![Trust Type](img/trust-type.png)

For Trust Direction, select Two-way and click next

![Trust Direction](img/trust-direction.png)

For the next wizard steps, keep the defaults and click next:

![Trust Side](img/side-trust.png)

![Trust Level](img/trust-level.png)

Enter a new password for the trust verification, you will need to provide this password back in the Cloud9 console:

![Trust Password](img/trust-password.png)

Click next and keep all the defaults until you finish the wizard, the trust is now ready from the ```corp.example.com``` side, click OK:

![Trust finished from corp](img/trust-done-from-corp.png)

Go back to the Cloud9 Terminal and provide the password you entered in the Trust wizard.

The deployment is now completed! The trust verification takes about 10-15 minutes.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

