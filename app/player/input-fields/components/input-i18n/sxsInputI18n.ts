// @npUpgrade-inputFields-true

const TEMPLATE = `
<input
  ng-if="$ctrl.inputtype=='input'"
  ng-change="$ctrl.emitUpdate()"
  ng-model="$ctrl.field[$ctrl.appState.lang]"
  name="{{$ctrl.textangularname}}"
  ng-required="$ctrl.doValidate">
<text-angular
  ng-if="$ctrl.inputtype == 'textarea'"
  name="{{$ctrl.textangularname}}"
  ng-required="$ctrl.doValidate"
  ng-model="$ctrl.field[$ctrl.appState.lang]"
  ta-paste="$ctrl.sanitizePastedHtml($html)"
  ta-default-wrap="span"
  ng-change="$ctrl.emitUpdate()"
  ng-blur="$ctrl.trim()">
</text-angular>

`;

interface IInputI18nBindings extends ng.IComponentController {
  field: any;
  inputtype: string;
  doValidate: boolean;
  onEmitName: ($ev: { $taName: string }) => ({$taName: string});
  onFieldChange: ($ev: { $field: any }) => ({ $field: any });
}

class InputI18nController implements IInputI18nBindings {
  field: any;
  inputtype: string;
  doValidate: boolean;
  onEmitName: ($ev: { $taName: string }) => ({$taName: string});
  onFieldChange: ($ev: { $field: any }) => ({ $field: any });
  //
  textangularname: string;
  static $inject = ['$timeout', '$attrs', 'appState', 'textAngularManager'];
  constructor(private $timeout: ng.ITimeoutService, private $attrs, private appState, private textAngularManager) {
    //
  }

  $onInit() {

    if (this.field == null) {
      this.field = {};
    }

    if (this.field[this.appState.lang] == null) {
      this.field = {
        en: ''
      };
    }

    //do this in both cases so we can use the name on regular text inputs in addition to textareas
    this.textangularname = 'ta' + new Date().getUTCMilliseconds() + 'y' + Math.random().toString(16);

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
    this.onEmitName({ $taName: this.textangularname });

    if (this.inputtype === 'textarea') {
      this.$timeout(() => { // wait for DOM
        if (this.$attrs.npAutofocus !== undefined) {
          const editorScope = this.textAngularManager.retrieveEditor(this.textangularname).scope;
          editorScope.displayElements.text.trigger('focus');
        }
      });
    }
  }

  emitUpdate() {
    this.onFieldChange({ $field: this.field });
  }

  trim() {
    // Let's prevent users from throwing extra whitespace at beginning and end:
    let txt = this.field[this.appState.lang];
    if (!txt) {
      return;
    }
    // console.log("BEFORE", txt);

    // yay regexp parsing of html my favorite thing to do
    txt = txt.replace(/<br\/>/g, '<br>'); // no xml-style tags

    // Replacing lots of complicated regexps with this brute force (we don't want user-input spans or divs anyway.)
    txt = txt.replace(/<div>/g, '<br>');
    txt = txt.replace(/<\/?(span|div)>/g, '');
    txt = txt.replace(/(<br>)*$/, ''); // kill extra linebreaks at end of entered text
    // console.log('AFTER', txt);
    this.field[this.appState.lang] = txt.trim();
  }

  sanitizePastedHtml(pasted: string) {
    // Strip out all markup from pasted content (to keep those addicted to MS Word from shooting themselves in the foot)
    const frag = document.createElement('div');
    frag.innerHTML = pasted;
    return frag.textContent;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class InputI18n implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    field: '<',
    inputtype: '@',
    doValidate: '<',
    onEmitName: '&',
    onFieldChange: '&?'
  };
  template: string = TEMPLATE;
  controller = InputI18nController;
  static Name: string = 'npInputI18n'; // tslint:disable-line
}
