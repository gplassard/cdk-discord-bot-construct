import type { Handler } from 'aws-lambda';
import { AWSLambdaServer, SlashCommand, SlashCreator } from 'slash-create';

export interface BotHandlerProps {
  commands: (typeof SlashCommand)[];
}

export class BotHandler {
  private readonly delegate = { handler: () => {} };
  constructor(private readonly props: BotHandlerProps) {
    const creator = new SlashCreator({
      applicationID: process.env.DISCORD_APP_ID!,
      publicKey: process.env.DISCORD_PUBLIC_KEY!,
      token: process.env.DISCORD_BOT_TOKEN!,
    });
    creator.withServer(new AWSLambdaServer(this.delegate, 'handler'))
      .registerCommands(this.props.commands);
  }

  handler(): Handler {
    return this.delegate.handler;
  }
}
