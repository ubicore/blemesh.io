
addEventListener('DOMContentLoaded', function() {
    var btn_scan = document.getElementById('btn_scan');
    btn_scan.addEventListener('click', function() {
        app.findProxies();
    });

    var btn_connection = document.getElementById('btn_connection');
    btn_connection.addEventListener('click', function() {
        app.connection();
    });

    var btn_submit = document.getElementById('btn_submit');
    btn_submit.addEventListener('click', function() {
        app.submitPdu();
    });

    var select_sar = document.getElementById('sar_selection');
    select_sar.addEventListener('change', function() {
        app.onSarSelect(this);
    });

    var msg_type = document.getElementById('msg_type');
    msg_type.addEventListener('change', function() {
        app.onMsgTypeSelect(this);
    });

    var opcode_selection = document.getElementById('opcode_selection');
    opcode_selection.addEventListener('change', function() {
        app.onOpcodeSelect(this);
    });

    var onoff_selection = document.getElementById('onoff_selection');
    onoff_selection.addEventListener('change', function() {
        app.onOnOffSelect(this);
    });
    
    var access_payload_input = document.getElementById('access_payload_hex');
    access_payload_input.addEventListener('change', function() {
        app.onAccessPayloadChanged();
    });
    
    var tid_hex = document.getElementById('tid_hex');
    tid_hex.addEventListener('change', function() {
        app.onTidChange(this);
    });

    var trans_time_hex = document.getElementById('trans_time_hex');
    trans_time_hex.addEventListener('change', function() {
        app.onTransTimeChange(this);
    });
    
    var delay_hex = document.getElementById('delay_hex');
    delay_hex.addEventListener('change', function() {
        app.onDelayChange(this);
    });

    var netkey_input = document.getElementById('netkey');
    netkey_input.addEventListener('change', function() {
        app.onNetKeyChanged();
    });
    
    var appkey_input = document.getElementById('appkey');
    appkey_input.addEventListener('change', function() {
        app.onAppKeyChanged();
    });

    var iv_index_input = document.getElementById('iv_index');
    iv_index_input.addEventListener('change', function() {
        app.onIvIndexChanged();
    });
    
    var ttl_input = document.getElementById('ttl');
    ttl_input.addEventListener('change', function() {
        app.onTtlChanged();
    });

    var src_input = document.getElementById('src');
    src_input.addEventListener('change', function() {
        app.onSrcChanged();
    });

    var dst_input = document.getElementById('dst');
    dst_input.addEventListener('change', function() {
        app.onDstChanged();
    });
    
    var select_sar = document.getElementById('sar_selection');
    select_sar.addEventListener('change', function() {
        app.onSarSelect(this);
    });
    
    var mtu = document.getElementById('mtu');
    mtu.addEventListener('change', function() {
        app.onMtuChanged(this);
    });
})
