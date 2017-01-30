/*jshint
    esversion: 6,
    unused: strict,
    undef: true,
    browser: true,
    devel: true
*/
/*globals
    MessageBotExtension
*/

var biblio_op = MessageBotExtension('biblio_op');

(function(ex, ui, storage, hook) {
    ex.setAutoLaunch(true);
    ex.uninstall = function() {
        ui.removeTab(ex.tab);
        storage.clearNamespace(ex.id + '_messages');
        hook.remove('world.command', opListener);
    };

    var messages = storage.getObject(ex.id + '_messages', []);

    ex.tab = ui.addTab('OP Log');
    ex.tab.innerHTML = '<style>#op_msgs .hidden{display: none;}#op_msgs .dismiss{#op_msgs .dismiss ; float: right; margin-right: 10px; background: #eaeaea; padding: 3px 4px; line-height: 1em; border-radius: 3px;}#op_msgs .item{position: relative;}#op_msgs .time{color: #909090; font-size: 0.7em; position: absolute; right: 40px; top: -8px;}</style><template id="op_template"> <div class="item"> <span class="name"> </span>: <span class="msg"></span> <span class="time"></span> <span class="dismiss">&times;</span> <hr> </div></template><div class="container"> <h3 class="title">Info</h3> <p>Players can now use /op to send a message to you, which will be saved here until you dismiss it.</p><h3 class="title">Saved Messages</h3> <input class="input" placeholder="Search..."/> <hr> <div id="op_msgs"></div></div>';
    messages.forEach(addToPage);

    var msgsDiv = ex.tab.querySelector('#op_msgs');
    ex.tab.querySelector('input').addEventListener('keyup', function(e) {
        var search = e.target.value.toLocaleUpperCase();

        Array.from(msgsDiv.children).forEach(function(child) {
            if (child.dataset.search.includes(search)) {
                child.classList.remove('hidden');
            } else {
                child.classList.add('hidden');
            }
        });
    });

    ex.tab.querySelector('#op_msgs').addEventListener('click', function(e) {
        if (e.target.classList.contains('dismiss')) {
            e.target.parentElement.remove();

            save();
        }
    });

    function save() {
        messages = [];
        Array.from(msgsDiv.children).forEach(function(child) {
            messages.push({
                name: child.dataset.name,
                message: child.dataset.message,
                timestamp: child.dataset.timestamp,
            });
        });
        storage.set(ex.id + '_messages', messages);
    }

    function addToPage(msg) {
        var time = new Date(+msg.timestamp);
        var timeStr = time.toLocaleDateString() + ', ' + time.toLocaleTimeString();
        ui.buildContentFromTemplate('#op_template', '#op_msgs', [
            {selector: 'div', 'data-name': msg.name, 'data-message': msg.message, 'data-timestamp': msg.timestamp, 'data-search': msg.name + ': ' + msg.message.toLocaleUpperCase()},
            {selector: '.name', text: msg.name},
            {selector: '.msg', text: msg.message},
            {selector: '.time', text: timeStr},
        ]);
    }

    hook.listen('world.command', opListener);
    function opListener(name, command, message) {
        command = command.toLocaleLowerCase();

        if (command != 'op') {
            return;
        }

        addToPage({name: name, message: message, timestamp: Date.now()});

        save();
    }
}(
    biblio_op,
    biblio_op.ui,
    biblio_op.storage,
    biblio_op.hook
));
