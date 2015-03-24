function vm() {};
vm.prefix = 'vm-';
vm.root = new Binding('$root', null);
vm.init = function() {
    var context = _fetch(attrSel('form'));
    context.length == 0 ? context = document : context;
    contribTypes.forEach(function(type) {
        _fetch(attrSel(type), context).forEach(function(element) {
            var attrString = element.getAttribute(vm.prefix + type);
            var binding = parseAttr(attrString);
            binding.attach(type, attrString, element);
        });
    });
}
vm.set = function(name, value) {
    var binding = parseAttr(name);
    binding.set(value);
}



var contribTypes = ['for', 'html', 'value', 'show', 'showInline', 'checked'];

function _fetch(selector, context) {
    var _context = context ? context[0] : document;
    return [].slice.call(_context.querySelectorAll(selector));
}

function attrSel(type) {
    return '[' + vm.prefix + type + ']';
}


function parseAttr(val, root, index) {
    var names = val.split('.');
    var binding = root ? root : vm.root;
    names.forEach(function(name) {
        if (name == '$root') {
            binding = vm.root;
        } else if (name == '$index' || name == '$key' || name == '$value') {
            binding = binding.bindings[index];
        } else {
            if (!(name in binding.bindings)) {
                binding.bindings[name] = new Binding(name, binding);
            }
            binding = binding.bindings[name];
        }
    });
    return binding;
}

var listeners = {
    'html': function(Contributor) {},
    'value': function(Contributor) {
        Contributor.node.addEventListener('input', function() {
            Contributor.binding.set(Contributor.getVal());
        });
    },
    'show': function(Contributor) {},
    'showInline': function(Contributor) {},
    'checked': function(Contributor) {
        Contributor.node.addEventListener('click', function() {
            Contributor.binding.set(Contributor.getVal());
        });
    },
    'for': function(Contributor) {
        Contributor.templateSize = Contributor.node.getElementsByTagName('*').length;
        Contributor.template = Contributor.node.innerHTML;
        Contributor.node.innerHTML = '';
    }
}
var getVal = {
    'html': function() {
        return this.innerHTML;
    },
    'value': function() {
        return this.node.value;
    },
    'show': function() {
        return this.node.display == 'block';
    },
    'showInline': function() {
        return this.node.display == 'inline-block';
    },
    'checked': function() {
        return this.node.checked;
    }
}
var handlers = {
    'html': function(val) {
        if (this.attrString == '$index' || this.attrString == '$key') {
            this.node.innerHTML = this.binding.name;
        } else {
            if (typeof(val) == 'object') {
                this.node.innerHTML = JSON.stringify(val);
            } else {
                this.node.innerHTML = val;
            }
        }
    },
    'value': function(val) {
        this.node.value = val;
    },
    'show': function(val) {
        this.node.style.display = val ? 'block' : 'none';
    },
    'showInline': function(val) {
        this.node.style.display = val ? 'inline-block' : 'none';
    },
    'checked': function(val) {
        this.node.checked = val;
    },
    'for': function(val) {
        this.node.innerHTML = '';
        var s = this;
        var len = 0;
        var keys = [];
        // console.log('----');
        for (key in val) {
            if (val.hasOwnProperty(key)) {
                s.node.innerHTML += s.template;
                // len++;
                keys.push(key);
            }
        }
        var children = s.node.getElementsByTagName('*');
        for (var i = 0; i < keys.length; i++) {
            for (var j = 0; j < s.templateSize; j++) {
                var child = children[i * s.templateSize + j];
                contribTypes.forEach(function(type) {
                    if (child.hasAttribute(vm.prefix + type)) {
                        var attrString = child.getAttribute(vm.prefix + type);
                        // console.log(attrString);
                        var bind = parseAttr(attrString, s.binding, i);
                        // console.log(bind);
                        bind.attach(type, attrString, child);
                    }
                });
            }

        }
    }
}


//TB
function Binding(name, ctx) {
    this.val = '';
    this.name = name;
    if (ctx) {
        ctx.bind(this);
    }
    this.bindings = {};
    this.contributors = [];
    this.subscribers = [];
}

Binding.prototype.bind = function(binding) {
    binding.setContext(this);
    this.bindings[binding.name] = binding;
}

Binding.prototype.setContext = function(binding) {
    this.context = binding;
}

/* Binding */
Binding.prototype.set = function(val) {
    /* todo: remove old keys (esp. for arrays) */
    if (typeof(val) == 'object') {
        this.val = val;
        var b;
        for (key in val) {
            if (!(key in this.bindings)) {
                this.bindings[key] = new Binding(key, this);
            }
            this.bindings[key].set(val[key]);
        }
    } else {
        if (val != this.val) {
            this.val = val;
            this.notify(this.val);
            if (this.context) {
                this.context.trigger();
            }
        }
    }
}

Binding.prototype.value = function() {
    if (Object.keys(this.bindings).length > 0) {
        var res = {};
        for (key in this.bindings) {
            res[key] = this.bindings[key].value();
        }
        this.val = res;
    }
    return this.val;
}

Binding.prototype.get = function(name) {
    return this.bindings[name];
}

Binding.prototype.trigger = function() {
    if (this.contributors.length > 0 || this.subscribers.length > 0) {
        this.notify(this.value());
    }
    if (this.context) {
        this.context.trigger();
    }
}

Binding.prototype.notify = function(val) {
    this.contributors.forEach(function(contributor) {
        contributor.handle(val);
    });
    this.subscribers.forEach(function(callback) {
        callback(val);
    });
}

Binding.prototype.subscribe = function(cb) {
    cb(this.val);
    this.subscribers.push(cb);
}

Binding.prototype.attach = function(type, attrString, element) {
        var cont = new Contributor(this, type, element, attrString);
        this.contributors.push(cont);
        return cont;
    }
    //TB END

//TC
function Contributor(binding, type, node, attrString) {
        this.binding = binding;
        this.node = node;
        this.attrString = attrString;
        this.type = type;
        this.getVal = getVal[type];
        this.handle = handlers[type];
        listeners[type](this);
        this.handle(binding.value());
}
    //TC END
if (typeof module !== 'undefined' && module.exports) {
    module.exports = vm;
} else {
    window.vm = vm;
}
