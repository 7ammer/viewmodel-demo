JSON.unflatten = function(data) {
    "use strict";
    if (Object(data) !== data || Array.isArray(data))
        return data;
    var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
        resultholder = {};
    for (var p in data) {
        var cur = resultholder,
            prop = "",
            m;
        while (m = regex.exec(p)) {
            cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
};

JSON.flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "~" + i + "");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"~"+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    console.log(result);
    return result;
}
//
// JSON.flatten = function(data) {
//     var result = {};
//     function recurse (cur, prop) {
//         if (Object(cur) !== cur) {
//             result[prop] = cur;
//         } else if (Array.isArray(cur)) {
//              for(var i=0, l=cur.length; i<l; i++)
//                  recurse(cur[i], prop + "[" + i + "]");
//             if (l == 0)
//                 result[prop] = [];
//         } else {
//             var isEmpty = true;
//             for (var p in cur) {
//                 isEmpty = false;
//                 recurse(cur[p], prop ? prop+"."+p : p);
//             }
//             if (isEmpty && prop)
//                 result[prop] = {};
//         }
//     }
//     recurse(data, "");
//     return result;
// }

function createTemplateObjFromSchema(schema, pick){
    var ss;
    if(pick){
        var testKey = new RegExp(pick.replace("$","\\$"));
        ss = _.clone(schema._schema);
        _.each(ss, function(v,key){
            if(!testKey.test(key)){
                delete ss[key];
            }
        });
    }else{
        ss=schema;
    }

    var newSchema = ss;
    _.each(newSchema, function(v,key){
        var newNam = key.replace(".$.","[0]").replace(".$","[0]");
        if (newSchema.hasOwnProperty(key)) {
            newSchema[newNam] = v.defaultValue || "";
            delete newSchema[key];
        }
    });
    return JSON.unflatten(newSchema);
}

var hero = new SimpleSchema({
    title: {type: String, label:"Title"},
    alignment: {type: String, label:"Alignment"}
});

var billboard = new SimpleSchema({
    title: { type: String, label:"Title"},
    background: { type: String, label:"Background"},
    items: {type:[Object],label:"Items Group"},
    'items.$.name': {type:String,label:"Item name"},
    'items.$.number': {type:Number,label:"Items number"},
    items2: {type:[String],label:"Items Group"},
    'items2.$': {type:String,label:"Item String"},
});

TestSchema = new SimpleSchema({
    title: {type: String, label:"Title", defaultValue:"defaulting"},
    body: {type: String, label:"Body", defaultValue:"defaulting"},
    'test.test2': {type: String, label:"test2", defaultValue:"defaulting"},
    layout: {type:[Object],label:"layout"},
    'layout.$.item':{type:String, label: "Comp Name",defaultValue:"hello", allowedValues: ["hero","billboard"]},
    'layout.$.hero':{type:hero, label: "Hero"},
    'layout.$.billboard':{type:billboard, label: "Billboard"}
});


if (Meteor.isClient) {
    Template.registerHelper("log", function(argument){
        console.log("log: ", argument);
    });

    // localColl = new Mongo.Collection(null);
    // localColl.insert({item:"hero", hero:{title:"hello moon", alignment: "left"}});
    // localColl.insert({item:"billboard", billboard:{title:"What's your favorite bar?", background:"Twix"}});
    // localColl.insert({item:"hero", hero:{title:"hello sun", alignment: "top"}});

    Pages = new Mongo.Collection(null);
    Pages.insert({
        _id:"khds89g8",
        title: "hello james",
        body: "body text here",
        test:{
            test2: "yo yo"
        },
        layout:[
            {_id:"gfds8089", item:"hero", hero:{title:"hello moon", alignment: "left"}},
            {_id:"jhds8908", item:"billboard", billboard:{title:"What's your favorite bar?", background:"Twix"}},
            {_id:"h8g9f090", item:"hero", hero:{title:"hello sun", alignment: "top"}}
        ]
    });



    ViewModel.share({
        pages: JSON.flatten(Pages.findOne({})),
        // {
            // formData: Pages,
            // schema: TestSchema
        // },
        utils:{
            val(field){
                console.log(field, this);
                return this[field]();
            },
            ssLabel: function(){
                var field = this.templateInstance.data.field;
                return field, this.schema()._schema[field].label;
            },
            ssDefaultValue: function(liveValue){
                if(liveValue){
                    return liveValue;
                }else{
                    var field = this.templateInstance.data.field;
                    return this.schema()._schema[field].defaultValue || "";
                }
            }
        }
    });

    Template.demoVM.viewmodel({
        onCreated: function() {
            this.load({share:['pages', 'utils']});
        },
        submit(){
            this.body("gfds");
            console.log(this.data());
            event.preventDefault();
        }
    });



    Template.basicForm.viewmodel({
        onCreated: function() {
            this.load({share:[this.templateInstance.data.shared, 'utils']});
        },
        submit(){
          console.log(this.data(),this.formData().findOne({}));
          event.preventDefault();
        }
    });

    Template.textInput.viewmodel({
        onCreated: function() {
            this.load({share:[this.templateInstance.data.shared, 'utils']});
        },
        // onRendered(){
        //     console.log(this);
        // }
    });

    Template.textareaInput.viewmodel({
        onCreated: function() {
            this.load({share:[this.templateInstance.data.shared, 'utils']});
        }
    });

    //TODO on create of this template create a localCollection and add only the needed field into it
        // this.formData().find({},{fields:{layout:1}})

    Template.dynamicForm.viewmodel({
        onCreated: function() {
            this.load({share:[this.templateInstance.data.shared, 'utils']});
        },
        collection() {
          return this.formData().findOne({},{fields:{layout:1}}).layout;
        },
        add(comp, schemaName,test){
            var objTml = createTemplateObjFromSchema(TestSchema, schemaName).layout[0][comp];

            localColl.insert({
                item: comp,
                [comp]: objTml
            });
            event.preventDefault();
        }
    });


    Template.arrayItem.viewmodel({
        delete() {
            event.preventDefault();
            var formDataId = this.parent().formData().findOne({})._id;

            this.parent().formData().update({_id: formDataId}, {$pull: {
                'layout': {'_id': this._id()}
            }});
        },
        getData(d){
            console.log(d[d.item]);
            return d[d.item];
        },
        //TODO get data and attach back to main dataStorage: this.formData()
        //TODO make saving automatic with events (keyup, input,change etc). Make sure its throttled
        save() {
            event.preventDefault();
            var formDataId = this.parent().formData().findOne({})._id;
            var d = this.data();
            d[d.item] = this.child(this.item()).data();

            this.parent().formData().update({_id:formDataId, 'layout._id': d._id}, {$set:{
                'layout.$': d
            }});
        }
    });
}
