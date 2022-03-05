function AppResource() {
    var self = this;

    this.Switch = `
        <ul class="list-group mb-3">
            <li class="list-group-item d-flex justify-content-between bg-light">
                <div>
                    <h6 class="my-0" style="color: #2A7D8D; cursor: pointer;" id="id_m_switch_name_[IDX]" onclick="window.ApplicationModules.DashboardView.UpdateSwitchInfo_onclick([IDX]);">Switch</h6>
                    <small class="text-muted">Brief description</small>
                </div>
                <div class="custom-control custom-switch">
                    <input type="checkbox" onclick="window.ApplicationModules.DashboardView.SetRelayValue('id_m_switch_[IDX]', [IDX]);" [STATE] class="custom-control-input" id="id_m_switch_[IDX]">
                    <label class="custom-control-label" for="id_m_switch_[IDX]"></label>
                </div>
            </li>
        </ul>
    `;

    this.UpdateNameModal = `
        <div class="row">
            <div class="col-xl-12" style="text-align: center">
                <input type="text" class="form-control" id="id_m_template_view_update_switch_name" placeholder="[VALUE]">
            </div>
        </div>
    `;

    this.UpdateNameModalConfirm = `
        <button type="button" class="btn btn-success btn-sm" onclick="window.ApplicationModules.DashboardView.SetName_onclick('[IDX]');">Save</button><button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
    `;

    this.BuildSwitches = function (data) {
        var html = "";
        
        for (idx = 0; idx < data.count; idx++) {
            var item = this.Switch;
            state = ((data.list >> idx) & 0x1) ? "checked": "";

            item = item.split("[IDX]").join(idx);
            item = item.split("[STATE]").join(state);
            html += item;
        }
        document.getElementById("id_m_switches_view_list_table").innerHTML = html;
    }

    this.SetSwitch = function (relay, id, index) {
        var obj = document.getElementById(id);
        if (obj.checked) {
            relay |= (1 << index);
        } else {
            relay &= ~(1 << index);
        }

        return relay;
    }

    return this;
}