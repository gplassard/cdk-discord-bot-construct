import type { Handler } from 'aws-lambda';
import { SlashCommand, SlashCreator } from 'slash-create';

export interface BotSyncerProps {
  commands: (typeof SlashCommand)[];
}
export class BotSyncer {
  private readonly creator: SlashCreator;
  constructor(private readonly props: BotSyncerProps) {
    this.creator = new SlashCreator({
      applicationID: process.env.DISCORD_APP_ID!,
      publicKey: process.env.DISCORD_PUBLIC_KEY!,
      token: process.env.DISCORD_BOT_TOKEN!,
    });

  }

  handler(): Handler {
    return async () => {
      console.log('Syncing commands classes', this.props.commands.map(c => c.name));
      await this.creator
        .registerCommands(this.props.commands)
        .syncCommandsAsync({
          deleteCommands: true,
        });
      const commands = Array.from(this.creator.commands.values()).map(c => c.toCommandJSON(true));
      console.log('Commands synced to discord', commands);
      return commands;
    };
  }
}
