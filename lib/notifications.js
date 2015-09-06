var util = require('util'),
    events = require('events'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Promise = require('promise'),
    xml2js = require('xml2js'),
    agentUtils = require('./utils');

function NotificationHandler() {
    var self = this;

    this.sessionNotification = function (notificationSet) {
        notificationSet.Notification.forEach(function (notification) {
            agentUtils.parseXml(notification)
                .then(function (parsed) {
                    self.emit('session', parsed.SessionNotification.Session[0].$);
                })
        });
    };

    this.router = express.Router();

    this.router.use('/agent/notification', bodyParser.text({type: 'text/xml'}), function (req, res) {
        res.send('OK');
        agentUtils.parseXml(req.body)
            .then(function (parsed) {
                switch (parsed.NotificationSet.$.svcid) {
                    case 'session':
                        self.sessionNotification(parsed.NotificationSet);
                        break;
                    default:
                        console.error('unknown notification type %s', parsed.$.svcid)
                }
            })
            .catch(function (err) {
                console.error(err);
            });
    });
}

util.inherits(NotificationHandler, events.EventEmitter);

module.exports.NotificationHandler = NotificationHandler;