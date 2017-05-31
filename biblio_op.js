/*jshint
    esversion: 6,
    unused: strict,
    undef: true,
    browser: true,
    devel: true
*/
/*globals
    MessageBot
*/

MessageBot.registerExtension('bibliofile/slash-op', function(ex, world) {
    function getMessages() {
        return world.storage.getObject('biblio_op_messages', []);
    }

    var addMessage = function(name, message) {
        var msgs = getMessages();
        msgs.push({name: name, message: message, timestamp: Date.now()});
        world.storage.set('biblio_op_messages', msgs);
    };

    function opListener(info) {
        if (info.command.toLocaleLowerCase() != 'op') {
            return;
        }

        addMessage(info.player.getName(), info.args);
    }
    world.onCommand.subscribe(opListener);

    ex.uninstall = function() {
        world.onCommand.unsubscribe(opListener);
        world.storage.clearNamespace('biblio_op');
    };

    // Browser only
    if (ex.isNode || !ex.bot.getExports('ui')) return;
    function extendFn(orig, fn) {
        return function() {
            orig.apply(this, arguments);
            fn.apply(this, arguments);
        };
    }

    var ui = ex.bot.getExports('ui');
    var tab = ui.addTab('OP Log');
    tab.innerHTML = '<style>#op_msgs .hidden{display: none;}#op_msgs .dismiss{#op_msgs .dismiss ; float: right; margin-right: 10px; background: #eaeaea; padding: 3px 4px; line-height: 1em; border-radius: 3px;}#op_msgs .item{position: relative;}#op_msgs .time{color: #909090; font-size: 0.7em; position: absolute; right: 40px; top: -8px;}</style><template> <div class="item"> <span class="name"> </span>: <span class="msg"></span> <span class="time"></span> <span class="dismiss">&times;</span> <hr> </div></template><div class="container"> <h3 class="title">Info</h3> <p>Players can now use /op to send a message to you, which will be saved here until you dismiss it.</p><h3 class="title">Saved Messages</h3> <input class="input" placeholder="Search..."/> <hr> <div id="op_msgs"></div></div>';

    tab.querySelector('input').addEventListener('keyup', function(e) {
        var search = e.target.value.toLocaleUpperCase();

        Array.from(tab.querySelector('#op_msgs').children).forEach(function(child) {
            if (child.dataset.search.includes(search)) {
                child.classList.remove('hidden');
            } else {
                child.classList.add('hidden');
            }
        });
    });

    tab.addEventListener('click', function(e) {
        if (e.target.classList.contains('dismiss')) {
            e.target.parentElement.remove();

            var messages = [];
            Array.from(tab.querySelector('#op_msgs').children).forEach(function(child) {
                messages.push({
                    name: child.dataset.name,
                    message: child.dataset.message,
                    timestamp: child.dataset.timestamp,
                });
            });

            world.storage.set('biblio_op_messages', messages);
        }
    });

    function addToPage(msg) {
        var time = new Date(+msg.timestamp);
        var timeStr = time.toLocaleDateString() + ', ' + time.toLocaleTimeString();
        ui.buildTemplate(tab.querySelector('template'), '#op_msgs', [
            {selector: 'div', 'data-name': msg.name, 'data-message': msg.message, 'data-timestamp': msg.timestamp, 'data-search': msg.name + ': ' + msg.message.toLocaleUpperCase()},
            {selector: '.name', text: msg.name},
            {selector: '.msg', text: msg.message},
            {selector: '.time', text: timeStr},
        ]);
    }
    getMessages().forEach(addToPage);

    addMessage = extendFn(addMessage, function(name, message) {
        addToPage({name: name, message: message, timestamp: Date.now()});
    });

    ex.uninstall = extendFn(ex.uninstall, function() {
        ui.removeTab(tab);
    });
});
