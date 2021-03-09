# Amazon Workspaces Demo


## About

![Architecture](img/architecture.svg)
## Getting Started

We recommend deploying this demo environment to the closest AWS Region where Workspaces is available, the latest list can be found [here](https://docs.aws.amazon.com/workspaces/latest/adminguide/azs-workspaces.html).

Create a [new Cloud9 Environment](https://console.aws.amazon.com/cloud9/home) in your prefer region from the list above.
![Launch Cloud9](img/launch-cloud9-name.png)

When configuring the Cloud9 environment, select the default options (Create a new EC2 instance with direct access, t2.micro, Amazon Linux 2)
![Configure Cloud9](img/configure-cloud9-settings.png)

We will be using the Cloud9 terminal to deploy the demo resources, you can maximize the terminal window to have a larger view:
![Maximize Cloud9 terminal](img/max-cloud9-terminal.png)

To start the deployment, execute the following command in your Cloud9 terminal:
```
bash <(curl -s https://raw.githubusercontent.com/aws-samples/amazon-workspaces-demo/main/deploy.sh)
```

Follow the instructions in the terminal to complete the deployment and configuration.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

