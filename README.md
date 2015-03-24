Vm.js
============
Simple ViewModel

### For value
```html
   <p>
   <input type='text' vm-value='demo-value'>
      <span vm-html='$root.demo-value'>b</span>
  </p>

```

### For Loops
```html
<form vm-form class="form">
  <div vm-for='contacts' >
    <p>
      <span vm-html='$index'>a</span>
      <span vm-html='$value.name.first'>b</span>
      <span vm-html='$value.name.last'>b</span>
      <span vm-html='$value.age'>b</span>
    </p>
  </div>
   <p>
   <input type='text' vm-value='demo-value'>
      <span vm-html='$root.demo-value'>b</span>
  </p>

  </form>
```
```js
    window.vm.init();
    window.vm.set('demo-value', 'wayne');
    window.vm.set('contacts', [{
      'name': {
        'first': 'cao',
        'last': 'zhiqiang'
      },
      'age': 58
    },{
      'name': {
        'first': 'vi',
        'last': 'wayne'
      },
      'age': 12
    },{
      'name': {
        'first': 'kylar',
        'last': 'wayne'
      },
      'age': 43
    }]);
```

### For Show
```html
  <button vm-show='showButton'>Continue</button>
  <input type='checkbox' vm-checked='showButton'> Show the button!
```

