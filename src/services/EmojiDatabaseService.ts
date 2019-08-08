
import * as Discord from 'discord.js';
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { Emoji } from '../entity/Emoji';
import { createConnection } from 'typeorm';
import { Logger } from '../services/Logger';

@Singleton
@AutoWired
export class EmojiDatabaseService extends BaseService {

  @Inject private logger: Logger;

  private dbclient;
  private emojiRepository;

  public async init(client: Discord.Client) {
    super.init(client);
    // Does this work as a non async call? Constructor is not asynchronous
    this.dbclient = await createConnection({
      type: 'sqlite',
      database: '../data/magireco.sqlite',  // Pass this in?
      entities: [
        Emoji
      ],
      synchronize: true,
      logging: false
    });
    this.emojiRepository = this.dbclient.getRepository(Emoji);
  }

  // Add emoji to the db, also add to
  async dbadd(emoji: Discord.Emoji | Discord.ReactionEmoji, user: Discord.User, message: Discord.Message, isReact = false) {
    const emojiEntity = new Emoji();

    emojiEntity.emojiid = emoji.id;
    emojiEntity.emojiname = emoji.name;
    emojiEntity.username = user.username;
    emojiEntity.userid = user.id;
    emojiEntity.reaction = isReact;
    emojiEntity.serverid = message.guild.id;
    emojiEntity.messageid = message.id;
    emojiEntity.time = Date.now();

    try {
      await this.emojiRepository.save(emoji);
      this.logger.log('Emoji added');
    } catch (e) {
      this.logger.error('Error in adding emoji to db: ', e);
    }
  }

  async reactionadd(emoji: Discord.Emoji | Discord.ReactionEmoji, user: Discord.User, message: Discord.Message) {
    await this.dbadd(emoji, user, message, true);
  }

  // Delete emoji from the db, used for TTL and Reaction removal
  // Is this used for anything aside from reactions? TTL can have separate function.
  async reactionremove(emoji: Discord.Emoji | Discord.ReactionEmoji, user: Discord.User, message: Discord.Message) {
    try {

      await this.emojiRepository.delete({
        emojiname: emoji.name,
        userid: user.id,
        messageid: message.id,
        reaction: true
      });
      this.logger.log('Emoji deleted');
    } catch (e) {
      this.logger.error('Error removing reaction: ', e);
    }

  }

  async printEmojis() {
    let allEmojis = await this.emojiRepository.find();
    this.logger.log(allEmojis);
  }

  // Lookup methods. Must include time frame.
  // Get server data
  async serverLookup() {

  }

  // get user data
  async userLookup() {

  }

  // get emoji data
  async emojiLookup() {

  }

  // get reaction data
  async reactionLookup() {

  }

  // get reaction by user data
  async reactionUserLookup() {

  }

  // getEmojiCount
  async constructEmojiCount() {

  }
}
