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
    var obj = document.getElementById(id);

    if (obj.checked) {
        this.RelayValue |= (1 << index);
    } else {
        this.RelayValue &= ~(1 << index);
    }

    app.Adaptor.SetRelayValue(this.RelayValue, function(data, error) {
        self.RelayValue = data.payload.value;
        self.BuildSwitcheList();
        self.UpdateSwitchesInfo();
    });
}

TemplateModuleView.prototype.BuildSwitcheList = function() {
    var html = "";
    for (idx = 0; idx < this.RelayCount; idx++) {
        state = ((this.RelayValue >> idx) & 0x1) ? "checked": "";

        var item = `
        <ul class="list-group mb-3">
            <li class="list-group-item d-flex justify-content-between bg-light">
                <div>
                    <h6 class="my-0" style="color: #2A7D8D; cursor: pointer;" id="id_m_switch_name_`+idx+`" onclick="window.ApplicationModules.DashboardView.UpdateSwitchInfo_onclick(`+idx+`);">Switch</h6>
                    <small class="text-muted">Brief description</small>
                </div>
                <div class="custom-control custom-switch">
                    <input type="checkbox" onclick="window.ApplicationModules.DashboardView.SetRelayValue('id_m_switch_`+idx+`', `+idx+`);" `+state+` class="custom-control-input" id="id_m_switch_`+idx+`">
                    <label class="custom-control-label" for="id_m_switch_`+idx+`"></label>
                </div>
            </li>
        </ul> `;
        html += item;
    }
    document.getElementById("id_m_switches_view_list_table").innerHTML = html;
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
    var content = `
        <div class="row">
            <div class="col-xl-12" style="text-align: center">
                <input type="text" class="form-control" id="id_m_template_view_update_switch_name" placeholder="`+document.getElementById("id_m_switch_name_"+idx).innerHTML+`">
            </div>
        </div>
    `;
    window.ApplicationModules.Modal.Remove();
    window.ApplicationModules.Modal.SetTitle("Update Name");
    window.ApplicationModules.Modal.SetContent(content);
    window.ApplicationModules.Modal.SetFooter(`<button type="button" class="btn btn-success btn-sm" onclick="window.ApplicationModules.DashboardView.SetName_onclick('`+idx+`');">Save</button><button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>`);
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
