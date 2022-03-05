function TemplateModuleView() {
    var self = this;

    // Modules basic
    this.HTML 	                    = "";
    this.HostingID                  = "";
    this.GraphModule                = null;
    this.DOMName                    = "";
    // Objects section
    this.HostingObject              = null;
    this.ComponentObject            = null;

    this.RelayCount                 = 0;
    this.RelayValue                 = 0;
    this.RelaySwitchTable           = null;
    this.Resource                   = new AppResource();

    return this;
}

TemplateModuleView.prototype.SetObjectDOMName = function(name) {
    this.DOMName = name;
}

TemplateModuleView.prototype.SetHostingID = function(id) {
    this.HostingID = id;
}

TemplateModuleView.prototype.PreBuild = function() {

}

TemplateModuleView.prototype.PostBuild = function() {
    var self = this;
    app.Adaptor.GetRelayCount(function(data, error) {
        self.RelayCount = data.payload.value;
        app.Adaptor.GetRelayValue(function(data, error) {
            self.RelayValue = data.payload.value;
            self.BuildSwitcheList();
            self.UpdateSwitchesInfo();
        });
    });    
}

TemplateModuleView.prototype.Build = function(data, callback) {
    var self = this;

    this.PreBuild();
	app.API.GetModuleUI("TemplateModuleView.html", function(html) {
        // Get HTML content
        self.HTML = html.replace("[ID]", self.HostingID);
        // Each UI module have encapsulated conent in component object (DIV)
        self.ComponentObject = document.getElementById("id_m_component_view_"+this.HostingID);
        // Apply HTML to DOM
        self.HostingObject = document.getElementById(self.HostingID);
        if (self.HostingObject !== undefined && self.HostingObject != null) {
            self.HostingObject.innerHTML = self.HTML;
        }
        
        self.PostBuild();
        // Call callback
        if (callback !== undefined && callback != null) {
            callback(self);
        }
    });
}

TemplateModuleView.prototype.Clean = function() {
}

TemplateModuleView.prototype.Hide = function() {
    this.ComponentObject.classList.add("d-none")
}

TemplateModuleView.prototype.Show = function() {
    this.ComponentObject.classList.remove("d-none")
}

TemplateModuleView.prototype.SetRelayValue = function(id, index) {
    var self = this;
    this.RelayValue = this.Resource.SetSwitch(this.RelayValue, id, index);

    app.Adaptor.SetRelayValue(this.RelayValue, function(data, error) {
        self.RelayValue = data.payload.value;
        self.BuildSwitcheList();
        self.UpdateSwitchesInfo();
    });
}

TemplateModuleView.prototype.BuildSwitcheList = function() {
    this.Resource.BuildSwitches({
        "count": this.RelayCount,
        "list": this.RelayValue
    });
}

TemplateModuleView.prototype.UpdateSwitchesInfo = function() {
    var self = this;
    app.Adaptor.GetRelayName(function(data, error) {
        self.RelaySwitchTable = data.payload.switches;

        for (key in self.RelaySwitchTable) {
            var relay = self.RelaySwitchTable[key];
            document.getElementById("id_m_switch_name_"+relay.idx).innerHTML = relay.name;
        }
    });
}

TemplateModuleView.prototype.UpdateSwitchInfo_onclick = function(idx) {
    var self = this;
    var value = document.getElementById("id_m_switch_name_"+idx).innerHTML;
    var content = this.Resource.UpdateNameModal;
    var confirm = this.Resource.UpdateNameModalConfirm;

    content = content.split("[VALUE]").join(value);
    confirm = confirm.split("[IDX]").join(idx);

    window.ApplicationModules.Modal.Remove();
    window.ApplicationModules.Modal.SetTitle("Update Name");
    window.ApplicationModules.Modal.SetContent(content);
    window.ApplicationModules.Modal.SetFooter(confirm);
    window.ApplicationModules.Modal.Build("sm");
    window.ApplicationModules.Modal.Show();
}

TemplateModuleView.prototype.SetName_onclick = function(idx) {
    var self = this;
    var name = document.getElementById("id_m_template_view_update_switch_name").value;
    app.Adaptor.SetRelayName(idx, name, function(data, error) {
        self.UpdateSwitchesInfo();
        window.ApplicationModules.Modal.Hide();
        // TODO - If return is false, show message
    });
}
