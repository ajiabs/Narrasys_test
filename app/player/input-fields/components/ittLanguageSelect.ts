// @npUpgrade-inputFields-true
import { IEpisode, IEvent } from '../../../models';
import { ILangformFlags } from '../../../interfaces';

/**
 * Created by githop on 8/23/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Default Language</div>
	<div class="input">
		<select
		  ng-change="$ctrl.onSelectChange()"
		  ng-model="$ctrl.data.defaultLanguage"
		  ng-options="{{$ctrl.ngOpts}}">
    </select>
	</div>
</div>
`;

interface ILanguageSelectBindings extends ng.IComponentController {
  data: IEpisode | IEvent;
  langForm: ILangformFlags;
  onSelectChange: () => void;
}

class LanguageSelectController implements ILanguageSelectBindings {
  data: IEpisode | IEvent;
  langForm: ILangformFlags;
  onSelectChange: () => void;
  //
  private _langOpts;
  static $inject = ['selectService'];

  constructor(private selectService) {
    //
  }

  get langOpts() {
    if (this._langOpts) {
      return this._langOpts;
    }
    return this.selectService.getSelectOpts('language');
  }

  set langOpts(val) {
    this._langOpts = val;
  }


  get ngOpts() {
    return 'option.value as option.name disable when option.isDisabled for option in $ctrl.langOpts';
  }

  $onInit() {
    this.langOpts = this.selectService.getSelectOpts('language');
  }

  $onChanges(changes: { langForm: ng.IChangesObject }) {
    if (changes && changes.langForm) {
      const nv = changes.langForm.currentValue;
      this.langOpts = this.langOpts.map((l) => {
        Object.entries(nv).forEach(([k, v]) => {
          if (l.value === k) {
            l.isDisabled = !v;
          }
        });
        return l;
      });
    }
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class LanguageSelect implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    langForm: '<?',
    onSelectChange: '&'
  };
  template: string = TEMPLATE;
  controller = LanguageSelectController;
  static Name: string = 'npLanguageSelect'; // tslint:disable-line
}
