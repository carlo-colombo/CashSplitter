angular.module('CashSplitter').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/bill/new.html',
    "<hr />\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-12\">\n" +
    "    <form role=\"form\" ng-submit=\"submit()\">\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"bill_amount\">Amount *</label>\n" +
    "        <input ng-model=\"bill.amount\" type=\"number\" step=\"any\" class=\"form-control\" id=\"bill_amount\" placeholder=\"Amount\" ng-required=\"true\">\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"bill_payer\">Payer</label>\n" +
    "        <select id=\"bill_payer\" ng-options=\"splitter as splitter for splitter in trip.splitters\" ng-model=\"bill.payer\" class=\"form-control\"></select>\n" +
    "      </div>\n" +
    "      <div class=\"checkbox\" ng-repeat=\"splitter in trip.splitters track by $index\">\n" +
    "        <label>\n" +
    "          <input checklist-model=\"bill.splitters\" type=\"checkbox\" checklist-value=\"splitter\">{{splitter}}\n" +
    "        </label>\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"bill_description\">Description</label>\n" +
    "        <input ng-model=\"bill.description\" type=\"text\" class=\"form-control\" id=\"bill_description\" placeholder=\"Description\">\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"bill_creationDate\">Date</label>\n" +
    "        <input ng-model=\"bill.creationDate\" type=\"datetime-local\" class=\"form-control\" id=\"bill_creationDate\" placeholder=\"Date\" ng-required=\"true\">\n" +
    "      </div>\n" +
    "      <button class=\"btn btn-success\" type=\"submit\">\n" +
    "        <icon name=\"money\"></icon>\n" +
    "      </button>\n" +
    "    </form>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<hr />\n"
  );


  $templateCache.put('views/entry/show.html',
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h3 class=\"panel-title\">\n" +
    "      <icon name=\"{{entry.type == 'bill' ? 'credit-card' : 'money'}}\"></icon>\n" +
    "      {{entry.creationDate | date:'medium'}}</h3>\n" +
    "  </div>\n" +
    "  <div class=\"panel-body\">\n" +
    "    {{entry.description}} <br />\n" +
    "    {{entry.splitters.join(', ')}}\n" +
    "  </div>\n" +
    "  <div class=\"panel-footer\">{{entry.amount | currency}}</div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/payment/new.html',
    "<hr />\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-12\">\n" +
    "    <form role=\"form\" ng-submit=\"submit()\">\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"payment_amount\">Amount *</label>\n" +
    "        <input ng-model=\"payment.amount\" type=\"number\" step=\"any\" class=\"form-control\" id=\"payment_amount\" placeholder=\"Amount\" ng-required=\"true\">\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"payment_source\">Source</label>\n" +
    "        <select id=\"payment_source\" ng-options=\"splitter as splitter for splitter in trip.splitters\" ng-model=\"payment.source\" class=\"form-control\"></select>\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"payment_target\">Target</label>\n" +
    "        <select id=\"payment_target\" ng-options=\"splitter as splitter for splitter in trip.splitters\" ng-model=\"payment.target\" class=\"form-control\"></select>\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"payment_description\">Description</label>\n" +
    "        <input ng-model=\"payment.description\" type=\"text\" class=\"form-control\" id=\"payment_description\" placeholder=\"Description\">\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"payment_creationDate\">Date</label>\n" +
    "        <input ng-model=\"payment.creationDate\" type=\"datetime-local\" class=\"form-control\" id=\"payment_creationDate\" placeholder=\"Date\" ng-required=\"true\">\n" +
    "      </div>\n" +
    "      <button class=\"btn btn-success\" type=\"submit\">\n" +
    "        <icon name=\"money\"></icon>\n" +
    "      </button>\n" +
    "    </form>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<hr />\n"
  );


  $templateCache.put('views/splitter/layout.html',
    "<div ui-view></div>"
  );


  $templateCache.put('views/splitter/show.html',
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-12\">\n" +
    "    <table class=\"table table-condensed table-bordered\">\n" +
    "      <tr ng-repeat=\"entry in entries\">\n" +
    "        <td>\n" +
    "          <icon name=\"{{entry[1].type == 'bill' ? 'credit-card' : 'money'}}\"></icon>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span class=\"pull-right\">{{entry[1].amount | $}}</span>\n" +
    "        </td>\n" +
    "        <td>{{entry[1].creationDate |date:'short'}}</td>\n" +
    "      </tr>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/trip/layout.html',
    "<div ui-view></div>"
  );


  $templateCache.put('views/trip/list.html',
    "<ul>\n" +
    "  <li ng-repeat=\"trip in trips\">\n" +
    "    <a ui-sref=\"trip.show({trip_id:trip.name})\">\n" +
    "       {{trip.name}}\n" +
    "    </a>\n" +
    "  </li>\n" +
    "</ul>\n"
  );


  $templateCache.put('views/trip/new.html',
    "<form role=\"form\" ng-submit=\"submit()\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"trip_name\">Name</label>\n" +
    "    <input ng-model=\"trip.name\" type=\"text\" class=\"form-control\" id=\"trip_name\" placeholder=\"Trip name\" ng-required>\n" +
    "  </div>\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"trip_splitters\">Splitters</label>\n" +
    "    <textarea id=\"trip_splitters\" ng-model=\"trip.splitters\" ng-list class=\"form-control\" placeholder=\"Splitters name splitted by comma(,)\"></textarea>\n" +
    "  </div>\n" +
    "  <button type=\"submit\" class=\"btn btn-default\">Add</button>\n" +
    "</form>\n"
  );


  $templateCache.put('views/trip/show.html',
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-6\">\n" +
    "    <div class=\"button-group\">\n" +
    "      <a class=\"btn btn-warning\" ui-sref=\"trip.show.bill_new({trip_id:trip.name})\">\n" +
    "        <icon name=\"plus\"></icon>\n" +
    "        <icon name=\"credit-card\"></icon>\n" +
    "      </a>\n" +
    "      <a class=\"btn btn-primary\" ui-sref=\"trip.show.payment_new({trip_id:trip.name})\">\n" +
    "        <icon name=\"minus\"></icon>\n" +
    "        <icon name=\"money\"></icon>\n" +
    "      </a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"col-xs-6\">\n" +
    "    <div class=\"button-group pull-right\">\n" +
    "      <button class=\"btn btn-danger\" ng-click=\"remove(trip)\">\n" +
    "        <icon name=\"trash-o\"></icon>\n" +
    "      </button>\n" +
    "      <a class=\"btn btn-danger\" ng-click=\"clean(trip)\">\n" +
    "        <icon name=\"fire\"></icon>\n" +
    "      </a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<hr />\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-12\">\n" +
    "    <table class=\"table table-bordered table-condensed table-striped\">\n" +
    "      <tr ng-repeat=\"splitter in trip.splitters track by $index\">\n" +
    "        <td>\n" +
    "          <a ui-sref=\"trip.show.splitter.show({splitter:splitter})\">\n" +
    "            {{splitter}}\n" +
    "          </a>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span class=\"pull-right\">{{splitted[splitter] | $}}</span>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div ui-view></div>\n" +
    "<div class=\"row\">\n" +
    "  <div class=\"col-xs-12\">\n" +
    "    <table class=\"table table-condensed table-bordered table-striped\">\n" +
    "      <tr ng-repeat=\"entry in entries\">\n" +
    "        <td>\n" +
    "          <a ui-sref=\"trip.show.entry.show({entry_id: entry[1]._id})\">\n" +
    "            <icon name=\"{{entry[1].type == 'bill' ? 'credit-card' : 'money'}}\"></icon>\n" +
    "          </a>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <span class=\"pull-right\">{{entry[1].amount | $}}</span>\n" +
    "        </td>\n" +
    "        <td>{{entry[0]}}</td>\n" +
    "        <td>{{entry[1].creationDate |date:'short'}}</td>\n" +
    "      </tr>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('views/trip/title.html',
    "<span class=\"navbar-brand\">\n" +
    "  <a ui-sref=\"trip.show({trip_id:trip._id})\">\n" +
    "  {{trip._id}}\n" +
    "  </a>\n" +
    "  {{trip.splitters.length}}\n" +
    "  <icon name=\"users\"></icon>\n" +
    "</span>\n"
  );

}]);
