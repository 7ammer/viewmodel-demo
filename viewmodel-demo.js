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
    title: {type: String, label:"Title"},
    layout: {type:[Object],label:"layout"},
    'layout.$.item':{type:String, label: "Comp Name",defaultValue:"hello", allowedValues: ["hero","billboard"]},
    'layout.$.hero':{type:hero, label: "Hero"},
    'layout.$.billboard':{type:billboard, label: "Billboard"}
});

if (Meteor.isClient) {
    localColl = new Mongo.Collection(null);
    localColl.insert({item:"hero", hero:{title:"hello moon", alignment: "left"}});
    localColl.insert({item:"billboard", billboard:{title:"What's your favorite bar?", background:"Twix"}});
    localColl.insert({item:"hero", hero:{title:"hello sun", alignment: "top"}});

    Template.dynamicForm.viewmodel({
        title: "hello world",
        collection() {
          return localColl.find();
        },
        submit(){
          console.log(localColl.find({}).fetch());
        },
        add(comp, schemaName){
            var objTml = createTemplateObjFromSchema(TestSchema, schemaName).layout[0][comp];

            localColl.insert({
                item: comp,
                [comp]: objTml
            });
        }
    });

    Template.arrayItem.viewmodel({
        delete() {
            localColl.remove({ _id: this._id() });
        },
        getData(id){
            var d = localColl.findOne({_id:id});
            console.log(d);
            return d[d.item];
        },
    });

    ViewModel.mixin({
        saveProps: {
            save(name) {
                localColl.update(this.parent()._id(), { $set: { [name]: this.data() }});
            }
        }
    })

    Template.hero.viewmodel({
        mixin: 'saveProps'
    });

    Template.billboard.viewmodel({
        mixin: 'saveProps'
    });
}
