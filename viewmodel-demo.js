if (Meteor.isClient) {
    Template.demoVM.viewmodel({
        title: "hello world",
        array:[
            {item:"foo"},
            {item:"bar"}
        ]
    });
}
