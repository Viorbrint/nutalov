const path = require('path');
const MTProto = require('@mtproto/core');
const { sleep } = require('@mtproto/core/src/utils/common');
const readlineSync = require('readline-sync');
const fs = require('fs');

// todo CONNECTION_API_ID_INVALID handle
// todo CONNECTION_API_HASH_INVALID handle


class API {
  constructor() {
    const { api_id, api_hash } = this.getKey();

    this.mtproto = new MTProto({
      api_id,
      api_hash,

      storageOptions: {
        path: path.resolve(__dirname, './data/1.json'),
      },
    });
  }

  async call(method, params, options = {}) {
    try {
      const result = await this.mtproto.call(method, params, options);

      return result;
    } catch (error) {
      console.log(`${method} error:`, error);

      const { error_code, error_message } = error;

      if (error_code === 420) {
        const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
        const ms = seconds * 1000;

        await sleep(ms);

        return this.call(method, params, options);
      }

      if (error_code === 303) {
        const [type, dcIdAsString] = error_message.split('_MIGRATE_');

        const dcId = Number(dcIdAsString);

        // If auth.sendCode call on incorrect DC need change default DC, because
        // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === 'PHONE') {
          await this.mtproto.setDefaultDc(dcId);
        } else {
          Object.assign(options, { dcId });
        }

        return this.call(method, params, options);
      }

      if (error_message === 'CONNECTION_API_ID_INVALID') {
        console.log('invalid api_id or api_hash');

        this.updateKey();

        return this.call(method, params, options);
      }

      return Promise.reject(error);
    }
  }

  async sendMessageTo(username, message) {
    const resolvedPeer = await this.call('contacts.resolveUsername', {
      username,
    });

    const user = resolvedPeer.users[0];

    const inputPeer = {
      _: 'inputPeerUser',
      user_id: user.id,
      access_hash: user.access_hash,
    };

    await this.call('messages.sendMessage', {
      clear_draft: true,
      peer: inputPeer,
      message,
      random_id: Math.ceil(Math.random() * 0xffffff) + Math.ceil(Math.random() * 0xffffff),
    });

    console.log(`message was send to ${username}`);
    console.log(message);
    console.log();
  }

  getKey() {
    const keysPath = path.resolve(__dirname, './data/keys.json');
    
    if (!fs.existsSync(keysPath)) {
      this.updateKey();
    }
    
    return JSON.parse(fs.readFileSync(keysPath).toString());
  }
  
  updateKey() {
    const dataPath = path.resolve(__dirname, './data');
    const keysPath = path.resolve(__dirname, './data/keys.json');
    fs.mkdirSync(dataPath, { recursive: true });

    const api_id = readlineSync.question('Enter api_id ', {
      hideEchoBack: true
    });

    const api_hash = readlineSync.question('Enter api_hash ', {
      hideEchoBack: true
    });

    fs.writeFileSync(keysPath, JSON.stringify({ api_id, api_hash }));

    this.mtproto = new MTProto({
      api_id,
      api_hash,

      storageOptions: {
        path: path.resolve(__dirname, './data/1.json'),
      },
    });

  }
}

const api = new API();

module.exports = api;