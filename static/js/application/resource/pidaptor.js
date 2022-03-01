function Pidaptor(api) {
    var self = this;
    this.API = api;

    return this;
}
Pidaptor.prototype.Echo = function(callback) {
    this.API.SendCustomCommand("echo", {
        "async": false
    }, function(data, error) {
        callback(data, error);
    });
}
Pidaptor.prototype.SetRelayValue = function(value, callback) {
    this.API.SendCustomCommand("set_relay_value", {
        "value": value,
        "async": false
    }, function(data, error) {
        callback(data, error);
    });
}
Pidaptor.prototype.GetRelayValue = function(callback) {
    this.API.SendCustomCommand("get_relay_value", {
        "async": false
    }, function(data, error) {
        callback(data, error);
    });
}
Pidaptor.prototype.GetRelayFeedback = function(callback) {
    this.API.SendCustomCommand("get_relay_feedback", {
        "async": false
    }, function(data, error) {
        callback(data, error);
    });
}
Pidaptor.prototype.GetRelayCount = function(callback) {
    this.API.SendCustomCommand("get_relay_count", {
        "async": false
    }, function(data, error) {
        callback(data, error);
    });
}
Pidaptor.prototype.SetRelayName = function(idx, name, callback) {
    this.API.SendCustomCommand("set_relay_name", {
        "idx": idx,
        "name": name,
        "async": false
    }, function(data, error) {
        callback(data, error);
    });
}
Pidaptor.prototype.GetRelayName = function(callback) {
    this.API.SendCustomCommand("get_relay_name", {
        "async": false
    }, function(data, error) {
        callback(data, error);
    });
}
