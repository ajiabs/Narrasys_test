/**
 * Created by githop on 6/5/17.
 */

const TEMPLATE = `
<div class="itt-filedrop itt-filedrop--border">  
  <div ng-transclude="target"></div>
  <div ng-transclude="preview"></div>
</div>
`;

class FiledropController implements ng.IComponentController {
  static $inject = ['$element'];
  onDrop: (files: any) => FileList;
  constructor(public $element){
  }

  $postLink() {
    this.attachListeners();
  }

  $onDestroy() {
    this.removeListeners();
  }

  private attachListeners(): void {
    this.$element[0].addEventListener('drop', (e: Event) => this.handleDrop(e));
    this.$element[0].addEventListener('dragover', (e: Event) => this.handleDragOver(e));
    this.$element[0].addEventListener('dragenter', (e: Event) => this.handleDragEnter(e));
    this.$element[0].addEventListener('dragleave', (e: Event) => this.handleDragLeave(e));
  }

  private removeListeners(): void {
    this.$element[0].removeEventListener('drop', (e: Event) => this.handleDrop(e));
    this.$element[0].removeEventListener('dragover', (e: Event) => this.handleDragOver(e));
    this.$element[0].removeEventListener('dragenter', (e: Event) => this.handleDragEnter(e));
    this.$element[0].removeEventListener('dragleave', (e: Event) => this.handleDragLeave(e));
  }

  private handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.handleDragLeave(e);
    this.onDrop({files: e.dataTransfer.files});
  };

  private handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.handleDragEnter(e);
    return false;
  };

  private handleDragEnter(ev) {
    this.$element.children().addClass('itt-filedrop--droppable');
  };

  private handleDragLeave(ev) {
    this.$element.children().removeClass('itt-filedrop--droppable');
  };
}


export class Filedrop implements ng.IComponentOptions {
  static Name: string = 'ittFiledrop';
  transclude = {
    'target': 'ittFiledropTarget',
    'preview': 'ittFiledropPreview'
  };
  bindings: any = {
    onDrop: '&'
  };
  template: string = TEMPLATE;
  controller = FiledropController;
}
