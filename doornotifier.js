/*
  Connects your Ring doorbell to your Google home
  Uses the 'doorbot' and 'node-googlehome' packages
  This code example triggers Google Home actions when a motion or ring event is detected
*/

const RingAPI = require('doorbot');
const GoogleHome = require('node-googlehome')

//Enter your RING account email and password to authenticate with the service
const ring = RingAPI({
    email: 'EMAIL',
    password: 'PASSWORD',
    retries: 10, //authentication retries, optional, defaults to 0
    userAgent: 'My User Agent', //optional, defaults to @android:com.ringapp:2.0.67(423)
    api_version: 11, //optional in case you need to change it from the default of 9
    timeout: (10 * 60 * 1000) //Defaults to 5 minutes
});
 
//Connects to your google home locally. If you want to use a remote service you will need to use the
//Google Assistant SDK. I set my Google Home using DHCP to static IP address
let device = new GoogleHome.Connecter('GOOGLE HOME LOCAL IP')
 
//main loop
ring.devices((e, devices) => {
    console.log(e, devices);
    ring.history((e, history) => {
        console.log(e, history);
        ring.recording(history[0].id, (e, recording) => {
            console.log(e, recording);
            const check = () => {
                console.log('Checking for ring activity..');
                ring.dings((e, json) => {
                    console.log(e, json);

                    //check for event
                    if(json.length > 0)
                    {
                        var resp = json[0];

                        //Event has been triggered could be motion event or a ring event
                        if(resp.state == 'ringing')
                        {
                            //Check if motion event
                            if(resp.motion == true)
                            {
                                device.speak('motion was detection at the frount door');
                                console.log('motion event');
                            }
                            else
                            {
                                //is a ring event i.e. someone has pressed the ring button
                                device.speak('Someone is at the frount door');
                                console.log('ring event');
                            }
                        }
                    }
                });
            };
            
            //activates loop every 10 seconds
            setInterval(check, 10 * 1000);
            check();
        });
    });
});
