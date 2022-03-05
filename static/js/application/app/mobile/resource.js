function AppResource() {
    var self = this;

    // class="ui-block-[INDEX]""
    this.Switch = `
        <div style="margin:3px" id="id_m_switch_[IDX]" onclick="window.ApplicationModules.DashboardView.SetRelayValue('id_m_switch_[IDX]', [IDX]);">
            <div class="ui-bar ui-bar-a" style="height:60px">
                <ul data-role="listview">
                    <li data-icon="bars">
                        <a href="#">
                            <h2><span data-feather="sun" style="color: [COLOR]"></span></h2>
                            <p id="id_m_switch_name_[IDX]">Switch</p>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
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
        var block_map = {
            0: "a",
            1: "b",
            2: "c"
        }

        var html = "";
        var modulo = 0;
        for (idx = 0; idx < data.count; idx++) {
            var item = this.Switch;
            state = ((data.list >> idx) & 0x1) ? "checked": "";

            var color = (state) ? "red" : "black";

            modulo = idx % 1;
            item = item.split("[INDEX]").join(block_map[modulo]);
            item = item.split("[IDX]").join(idx);
            item = item.split("[STATE]").join(state);
            item = item.split("[COLOR]").join(color);
            html += item;
        }
        document.getElementById("id_m_switches_view_list_table").innerHTML = html;
        feather.replace();

        $('#id_m_switches_view_list_table ul').each(function() {
            $(this).listview().listview("refresh");
        })
    }

    this.SetSwitch = function (relay, id, index) {
        var status  = relay & (1 << index);
        if (status) {
            relay &= ~(1 << index);
        } else {
            relay |= (1 << index);
        }

        return relay;
    }

    return this;
}