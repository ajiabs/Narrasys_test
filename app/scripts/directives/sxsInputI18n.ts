sxsInputI18n.$inject = ['$timeout', 'appState', 'textAngularManager'];

export default function sxsInputI18n($timeout, appState, textAngularManager) {
  return {
    templateUrl: 'templates/producer/inputi18n.html',
    scope: {
      field: "=sxsInputI18n",
      inputtype: "=inputtype",
      doValidate: '=',
      onEmitName: '&'
    },
    link: function (scope, el, attrs) {
      if (!scope.field) {
        // need to init the object if it's empty
        scope.field = {
          en: ""
        };
      }
      scope.appState = appState;
      //do this in both cases so we can use the name on regular text inputs in addition to textareas
      scope.textangularname = "ta" + new Date().getUTCMilliseconds() + "y" + Math.random().toString(16);
      /*
       textAngular requires unique name attributes set on the textarea or input element
       ng-forms will use the name attribute as a namespace for ng-specific state regarding
       the various states of validity an item can be in.

       example:
       <form ng-form="aForm">
       <input type="text" name="firstName">
       </form>

       will result in an ngform object like so:
       aForm.firstName = {$valid: <boolean>, $invalid: <boolean>, $dirty: <boolean>}

       It's hard to known the name of the textarea, because we ensure that it is unique by
       randomly creating a name prop based upon the current time.

       this makes the following technique a little harder:
       <p ng-if="aForm.firstName.$invalid">this is a required field</p>
       because firstName (the value of the name attribute on the text area) is randomly generated.

       the solution is to emit the name up to the directive that is consuming sxsInputI18n
       after it has been set, then we can check the state of the validity in the parent component.
       */
      scope.onEmitName({$taName: scope.textangularname});

      if (scope.inputtype === 'textarea') {

        $timeout(function () { // wait for DOM
          if (attrs.autofocus !== undefined) {
            var editorScope = textAngularManager.retrieveEditor(scope.textangularname).scope;
            editorScope.displayElements.text.trigger('focus');
          }
        });

        scope.trim = function () {
          // Let's prevent users from throwing extra whitespace at beginning and end:
          var txt = scope.field[appState.lang];
          if (!txt) {
            return;
          }
          console.log("BEFORE", txt);

          // yay regexp parsing of html my favorite thing to do
          txt = txt.replace(/<br\/>/g, '<br>'); // no xml-style tags

          // Replacing lots of complicated regexps with this brute force (we don't want user-input spans or divs anyway.)
          txt = txt.replace(/<div>/g, '<br>');
          txt = txt.replace(/<\/?(span|div)>/g, '');
          txt = txt.replace(/(<br>)*$/, ''); // kill extra linebreaks at end of entered text

          console.log("AFTER", txt);
          scope.field[appState.lang] = txt;
        };

        scope.sanitizePastedHtml = function (pasted) {
          // Strip out all markup from pasted content (to keep those addicted to MS Word from shooting themselves in the foot)
          var frag = document.createElement("div");
          frag.innerHTML = pasted;
          return frag.textContent;
        };

      }
    }
  };
}
