exports.success = ((message, positive_output, callback) => {
  message.react('✅').then(() => {
    if (callback) callback();
  }).catch(err => {
    message.reply(!!positive_output ? positive_output : 'success.').then(() => {
      if (callback) callback();
    });
  });
});

exports.failure = ((message, negative_output, callback) => {
  message.react('❌').then(() => {
    if (callback) callback();
  }).catch(err => {
    message.reply(!!negative_output ? negative_output : 'failed.').then(() => {
      if (callback) callback();
    });
  });
});