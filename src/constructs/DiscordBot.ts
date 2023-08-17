import { CfnOutput, Duration, RemovalPolicy, ScopedAws, SecretValue } from 'aws-cdk-lib';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Architecture, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface DiscordBotProps {
  name: string;
  handler: {
    entry: string;
  };
  syncer: {
    entry: string;
  };
  credentials: {
    botAppId: string;
    botPublicKey: string;
    botToken: SecretValue;
  };
}

export class DiscordBot extends Construct {

  constructor(scope: Construct, id: string, props: DiscordBotProps) {
    super(scope, id);

    const env = {
      DISCORD_APP_ID: props.credentials.botAppId,
      DISCORD_PUBLIC_KEY: props.credentials.botPublicKey,
      DISCORD_BOT_TOKEN: props.credentials.botToken.unsafeUnwrap(),
    };

    const handlerFunctionName = props.name + '-handler';
    const botHandlerLog = new LogGroup(this, 'BotHandlerLog', {
      removalPolicy: RemovalPolicy.DESTROY,
      logGroupName: `/aws/lambda/${handlerFunctionName}`,
      retention: RetentionDays.ONE_MONTH,
    });
    const botHandler = new NodejsFunction(this, 'BotHandler', {
      entry: props.handler.entry,
      functionName: handlerFunctionName,
      architecture: Architecture.ARM_64,
      environment: env,
      memorySize: 512,
    });
    botHandler.node.addDependency(botHandlerLog);
    const botHandlerUrl = botHandler.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, 'BotHandlerOutput', {
      value: `${botHandlerUrl.url}event`,
      description: 'Set this as the "Interactions Endpoint URL" in your app https://discord.com/developers/applications',
    });


    const syncerFunctionName = `${props.name}-syncer`;
    const botSyncerLog = new LogGroup(this, 'BotSyncerLog', {
      removalPolicy: RemovalPolicy.DESTROY,
      logGroupName: `/aws/lambda/${syncerFunctionName}`,
      retention: RetentionDays.ONE_MONTH,
    });
    const botSyncer = new NodejsFunction(this, 'BotSyncer', {
      entry: props.syncer.entry,
      functionName: syncerFunctionName,
      architecture: Architecture.ARM_64,
      environment: env,
      reservedConcurrentExecutions: 1,
      timeout: Duration.seconds(30),
      memorySize: 512,
    });
    botSyncer.node.addDependency(botSyncerLog);
    // Trigger update of commands after each deployment
    new Rule(this, 'SyncerTriggerRule', {
      eventPattern: {
        source: ['aws.cloudformation'],
        account: [new ScopedAws(this).accountId],
        resources: [new ScopedAws(this).stackId],
        detailType: ['CloudFormation Stack Status Change'],
        detail: {
          'status-details': {
            status: ['CREATE_COMPLETE', 'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE', 'UPDATE_ROLLBACK_FAILED', 'DELETE_IN_PROGRESS'],
          },
        },
      },
      targets: [new LambdaFunction(botSyncer)],
    });

  }
}
