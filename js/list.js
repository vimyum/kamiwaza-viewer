let fs = require('fs');

var confObj = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var listApp = new Vue({
    el: '#list',
    data: {
        items: confObj.sort((a, b) => (a.id - b.id)),
        search: "",
    },
    computed: {
        /**
         * searchの値で絞り込み(部分一致)
         */
        filteredItems: function() {
            let searchReg = new RegExp('.*' + this.search + '.*');
            return this.items.slice(1).filter((elem) => {
                return searchReg.test(elem.name);
            });
        }
    }
});
