(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@bhmb/bot')) :
	typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
	(factory(global['@bhmb/bot']));
}(this, (function (bot) { 'use strict';

var html = "<style>\r\n    #op_msgs .hidden { display: none; }\r\n    #op_msgs .dismiss { float: right; margin-right: 10px; background: #eaeaea; padding: 3px 4px; line-height: 1em; border-radius: 3px; }\r\n    #op_msgs .item { position: relative; }\r\n    #op_msgs .time {color: #909090; font-size: 0.7em; position: absolute; right: 40px; top: -8px;}\r\n</style>\r\n\r\n<template>\r\n    <div class=\"item\">\r\n        <span class=\"name\">\r\n        </span>: <span class=\"msg\"></span>\r\n        <span class=\"time\"></span>\r\n        <span class=\"dismiss\">&times;</span>\r\n        <hr>\r\n    </div>\r\n</template>\r\n\r\n<div class=\"container\">\r\n    <h3 class=\"title\">Info</h3>\r\n    <p>Players can now use /op to send a message to you, which will be saved here until you dismiss it.</p>\r\n    <h3 class=\"title\">Saved Messages</h3>\r\n    <input class=\"input\" placeholder=\"Search...\"/>\r\n    <hr>\r\n    <div id=\"op_msgs\"></div>\r\n</div>\r\n";

bot.MessageBot.registerExtension('bibliofile/slash_op', (ex, world) => {
    const getMessages = () => ex.storage.get('messages', []);
    const addMessage = (name, message) => {
        ex.storage.set('messages', [...getMessages(), { name, message, timestamp: Date.now() }]);
    };
    world.addCommand('op', (player, message) => {
        addMessage(player.name, message);
    });
    ex.remove = () => world.removeCommand('op');
    // Browser only
    const ui = ex.bot.getExports('ui');
    if (!ui)
        return;
    var tab = ui.addTab('OP Log');
    tab.innerHTML = html;
    const input = tab.querySelector('input');
    const children = tab.querySelector('#op_msgs').children;
    input.addEventListener('keyup', () => {
        let search = input.value.toLocaleUpperCase();
        Array.from(children).forEach((child) => {
            if (child.dataset.search.includes(search)) {
                child.classList.remove('hidden');
            }
            else {
                child.classList.add('hidden');
            }
        });
    });
    tab.addEventListener('click', function (e) {
        const target = e.target;
        if (target.classList.contains('dismiss')) {
            target.parentElement.remove();
            let messages = [];
            Array.from(children).forEach((child) => {
                messages.push({
                    name: child.dataset.name,
                    message: child.dataset.message,
                    timestamp: +child.dataset.timestamp,
                });
            });
            ex.storage.set('messages', messages);
        }
    });
    function addToPage(msg) {
        let time = new Date(+msg.timestamp);
        let timeStr = time.toLocaleDateString() + ', ' + time.toLocaleTimeString();
        ui.buildTemplate(tab.querySelector('template'), '#op_msgs', [
            { selector: 'div',
                'data-name': msg.name,
                'data-message': msg.message,
                'data-timestamp': msg.timestamp,
                'data-search': msg.name + ': ' + msg.message.toLocaleUpperCase()
            },
            { selector: '.name', text: msg.name },
            { selector: '.msg', text: msg.message },
            { selector: '.time', text: timeStr },
        ]);
    }
    getMessages().forEach(addToPage);
    world.removeCommand('op');
    world.addCommand('op', (player, message) => {
        addMessage(player.name, message);
        addToPage({ name: player.name, message, timestamp: Date.now() });
    });
    ex.remove = () => {
        world.removeCommand('op');
        ui.removeTab(tab);
    };
});

})));
