
export class sidenavDd implements ng.IComponentOptions {
    title: string;

    static $inject = ['$state'];
    constructor($state) {
        this.title = 'HEADER';
    }

    controller = sidenavDdCtrl;
    controllerAs = 'vm';
    bindings = {
        options: '=',
    };
    template = `<h1>{{vm.options}}</h1>`;
}

class sidenavDdCtrl {
    static $inject = ['$scope', '$element', '$attrs'];
    constructor($scope, $element, $attrs) { 
        $scope.title = 'DIRECTIVE';
    }

    $onInit() { 

    }

    $onChanges(changesObj) {

    }

    $doCheck() {

    }

    $onDestroy() {

    }
}