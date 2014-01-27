describe("TwitterQueue", function(){
    var mgmt;
    beforeEach(function(){
        mgmt = new twitterQueueMgmt();

        this.addMatchers({
            toBeAnObject: function(){
                this.message = function(){return "Expected an object. Got a " + typeof this.actual}
                return this.actual instanceof Object
            }
        })
    })

    it ("runs", function(){
        expect(true).toBe(true);
    });

    it ("init", function(){
        expect(mgmt.queue.length).toBe(0);
    })

    it ("can add a tweet", function(){
        mgmt.addTweet({user:{name:"Drew Shefman"}, text:"help 1", created_at: new Date()})
        expect(mgmt.queue.length).toBe(1);
        expect(mgmt.queue[0].text).toEqual("Drew Shefman >> help 1")
    })

    it ("can add a tweet from a name", function(){
        var rtn = mgmt.addTweetFromName("Drew","Shefman")
        expect(mgmt.queue.length).toBe(1);
        expect(mgmt.queue[0].text).toEqual("Drew Shefman")
        expect(rtn.fullString).toContain("Drew Shefman needs help. #uhmultimediaHelp @UHMultimedia")
        expect(rtn.fullString).toMatch(/~\d+/)
    })

    it ("is a string, convert to an object", function(){
        mgmt.addTweetFromName("Drew Shefman");
        var obj =  mgmt.queue[0]
        expect(obj).toBeAnObject();
        expect(obj.text).toBeDefined();
        expect(obj.dateF).toBeDefined();
        expect(obj.minsAgo).toBeDefined();
    })

    it ("is a object, stays an object", function(){
        var obj =mgmt.addTweet({text:"Drew Shefman", created_at: new Date()});
        expect(obj).toBeAnObject();
        expect(obj.text).toBeDefined();
        expect(obj.dateF).toBeDefined();
        expect(obj.minsAgo).toBeDefined();
    })

    it ("it happened a minute ago", function(){
        var obj = mgmt.addTweet({text:"Drew Shefman", created_at: new Date(new Date()-(60*1000))});
        expect(obj.minsAgo).toEqual(1);
    })

    it ("12 hour time format with 0 timezone offset", function(){
        mgmt.setTimezoneOffset(0);
        var obj = mgmt.addTweet({text:"Drew Shefman", created_at: new Date("Jan 23 2014 13:30")});
        expect(obj.dateF).toMatch(/\d+:\d+ [ap]m/); //01:30 pm
        expect(obj.dateF.length).toEqual(8); //should have leading zeros
        expect(obj.dateF).toEqual("01:30 pm");
    })

    it ("12 hour time format with default timezone offset", function(){
        var obj = mgmt.addTweet({text:"Drew Shefman", created_at: new Date("Jan 23 2014 13:30")});
        expect(obj.dateF).toMatch(/\d+:\d+ [ap]m/); //01:30 pm
        expect(obj.dateF.length).toEqual(8); //should have leading zeros
        expect(obj.dateF).toEqual("08:30 am");
    })

    it ("Duration expired at date", function(){
        var obj = mgmt.addTweet({text:"Drew Shefman", created_at: new Date("Jan 23 2014 13:30")});
        expect(mgmt.queue.length).toBe(0);

    })

    it ("Duration expired at 1 mins, it is 1 min", function(){
        mgmt.setMinutesToTweetExpiration(1);
        var obj = mgmt.addTweet({text:"Drew Shefman", created_at: new Date(new Date()-(1*60*1000))});
        expect(mgmt.queue.length).toBe(1);

    })

    it ("Duration expired at 1 mins, it is 2 min", function(){
        mgmt.setMinutesToTweetExpiration(1);
        var obj = mgmt.addTweet({text:"Drew Shefman", created_at: new Date(new Date()-(2*60*1000))});
        expect(mgmt.queue.length).toBe(0);

    })

    it ("resets queue if adding multiples", function(){
        mgmt.setMinutesToTweetExpiration(1);
        var obj = mgmt.addTweet({text:"Drew Shefman", created_at: new Date()});
        expect(mgmt.queue.length).toBe(1);
        mgmt.addTweets([{text:"Andrew Shefman", created_at: new Date()}])
        expect(mgmt.queue.length).toBe(1);


    })
})