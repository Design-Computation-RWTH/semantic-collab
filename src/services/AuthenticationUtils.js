import React from "react";
import PubSub from "pubsub-js";


const Logout = () => (
    <div>Logged out
        {PubSub.publish('CloseMenu',"")}
        {
            window.location.replace(
                `${"/login"}`
            )
        }
    </div>
);


const id = (() => {
    let currentId = 0;
    const map = new WeakMap();

    return (object) => {
        if (!map.has(object)) {
            map.set(object, ++currentId);
        }

        return map.get(object);
    };
})();

function parseJWT (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export  {parseJWT};
export  {id};
export  {Logout};