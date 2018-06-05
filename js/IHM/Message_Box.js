





const Messages = [
  //Defined in Mesh Profile Specification
{id: 0x00, size: 1, name: 'Config_AppKey_Add' , TX_fct: null, RX_fct: null, callback: null},
{id: 0x01, size: 1, name: 'Config_AppKey_Update', TX_fct: null, RX_fct: null, callback: null},
{id: 0x02, size: 1, name: 'Config_Composition_Data_Status', TX_fct: null, RX_fct: Config.OUT.Composition_Data_Status, callback: null},
{id: 0x03, size: 1, name: 'Config_Model_Publication_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x04, size: 1, name: 'Health_Current_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x05, size: 1, name: 'Health_Fault_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x06, size: 1, name: 'Config_Heartbeat_Publication_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8000, size: 1, name: 'Config_AppKey_Delete', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8001, size: 1, name: 'Config_AppKey_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8002, size: 2, name: 'Config_AppKey_List', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8003, size: 2, name: 'Config_AppKey_Status', TX_fct: null, RX_fct: Config.OUT.AppKey_Status, callback: null},
{id: 0x8004, size: 2, name: 'Health_Attention_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8005, size: 2, name: 'Health_Attention_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8006, size: 2, name: 'Health_Attention_Set_Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8007, size: 2, name: 'Health_Attention_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8008, size: 2, name: 'Config_Composition_Data_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8009, size: 2, name: 'Config_Beacon_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x800A, size: 2, name: 'Config_Beacon_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x800B, size: 2, name: 'Config_Beacon_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x800C, size: 2, name: 'Config_Default_TTL_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x800D, size: 2, name: 'Config_Default_TTL_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x800E, size: 2, name: 'Config_Default_TTL_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x800F, size: 2, name: 'Config_Friend_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8010, size: 2, name: 'Config_Friend_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8011, size: 2, name: 'Config_Friend_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8012, size: 2, name: 'Config_GATT_Proxy_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8013, size: 2, name: 'Config_GATT_Proxy_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8014, size: 2, name: 'Config_GATT_Proxy_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8015, size: 2, name: 'Config_Key_Refresh_Phase_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8016, size: 2, name: 'Config_Key_Refresh_Phase_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8017, size: 2, name: 'Config_Key_Refresh_Phase_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8018, size: 2, name: 'Config_Model_Publication_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8019, size: 2, name: 'Config_Model_Publication_Status', TX_fct: null, RX_fct: Config.OUT.Model_Publication_Status, callback: null},
{id: 0x801A, size: 2, name: 'Config_Model_Publication_Virtual_Address_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x801B, size: 2, name: 'Config_Model_Subscription_Add', TX_fct: null, RX_fct: null, callback: null},
{id: 0x801C, size: 2, name: 'Config_Model_Subscription_Delete', TX_fct: null, RX_fct: null, callback: null},
{id: 0x801D, size: 2, name: 'Config_Model_Subscription_Delete_All', TX_fct: null, RX_fct: null, callback: null},
{id: 0x801E, size: 2, name: 'Config_Model_Subscription_Overwrite', TX_fct: null, RX_fct: null, callback: null},
{id: 0x801F, size: 2, name: 'Config_Model_Subscription_Status', TX_fct: null, RX_fct: Config.OUT.Model_Subscription_Status, callback: null},
{id: 0x8020, size: 2, name: 'Config_Model_Subscription_Virtual_Address_Add', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8021, size: 2, name: 'Config_Model_Subscription_Virtual_Address_Delete', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8022, size: 2, name: 'Config_Model_Subscription_Virtual_Address_Overwrite', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8023, size: 2, name: 'Config_Network_Transmit_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8024, size: 2, name: 'Config_Network_Transmit_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8025, size: 2, name: 'Config_Network_Transmit_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8026, size: 2, name: 'Config_Relay_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8027, size: 2, name: 'Config_Relay_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8028, size: 2, name: 'Config_Relay_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8029, size: 2, name: 'Config_SIG_Model_Subscription_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x802A, size: 2, name: 'Config_SIG_Model_Subscription_List', TX_fct: null, RX_fct: null, callback: null},
{id: 0x802B, size: 2, name: 'Config_Vendor_Model_Subscription_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x802C, size: 2, name: 'Config_Vendor_Model_Subscription_List', TX_fct: null, RX_fct: null, callback: null},
{id: 0x802D, size: 2, name: 'Config_Low_Power_Node_PollTimeout_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x802E, size: 2, name: 'Config_Low_Power_Node_PollTimeout_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x802F, size: 2, name: 'Health_Fault_Clear', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8030, size: 2, name: 'Health_Fault_Clear_Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8031, size: 2, name: 'Health_Fault_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8032, size: 2, name: 'Health_Fault_Test', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8033, size: 2, name: 'Health_Fault_Test_Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8034, size: 2, name: 'Health_Period_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8035, size: 2, name: 'Health_Period_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8036, size: 2, name: 'Health_Period_Set_Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8037, size: 2, name: 'Health_Period_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8038, size: 2, name: 'Config_Heartbeat_Publication_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8039, size: 2, name: 'Config_Heartbeat_Publication_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x803A, size: 2, name: 'Config_Heartbeat_Subscription_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x803B, size: 2, name: 'Config_Heartbeat_Subscription_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x803C, size: 2, name: 'Config_Heartbeat_Subscription_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x803D, size: 2, name: 'Config_Model_App_Bind', TX_fct: null, RX_fct: null, callback: null},
{id: 0x803E, size: 2, name: 'Config_Model_App_Status', TX_fct: null, RX_fct: Config.OUT.Model_App_Status, callback: null},
{id: 0x803F, size: 2, name: 'Config_Model_App_Unbind', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8040, size: 2, name: 'Config_NetKey_Add', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8041, size: 2, name: 'Config_NetKey_Delete', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8042, size: 2, name: 'Config_NetKey_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8043, size: 2, name: 'Config_NetKey_List', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8044, size: 2, name: 'Config_NetKey_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8045, size: 2, name: 'Config_NetKey_Update', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8046, size: 2, name: 'Config_Node_Identity_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8047, size: 2, name: 'Config_Node_Identity_Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8048, size: 2, name: 'Config_Node_Identity_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8049, size: 2, name: 'Config_Node_Reset', TX_fct: null, RX_fct: null, callback: null},
{id: 0x804A, size: 2, name: 'Config_Node_Reset_Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x804B, size: 2, name: 'Config_SIG_Model_App_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x804C, size: 2, name: 'Config_SIG_Model_App_List', TX_fct: null, RX_fct: null, callback: null},
{id: 0x804D, size: 2, name: 'Config_Vendor_Model_App_Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x804E, size: 2, name: 'Config_Vendor_Model_App_List', TX_fct: null, RX_fct: null, callback: null},
//Defined in Mesh Model Specification
{id: 0x8201, size: 2, name: 'Generic OnOff Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8202, size: 2, name: 'Generic OnOff Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8203, size: 2, name: 'Generic OnOff Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8204, size: 2, name: 'Generic OnOff Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8205, size: 2, name: 'Generic Level Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8206, size: 2, name: 'Generic Level Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8207, size: 2, name: 'Generic Level Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8208, size: 2, name: 'Generic Level Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8209, size: 2, name: 'Generic Delta Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x820A, size: 2, name: 'Generic Delta Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x820B, size: 2, name: 'Generic Move Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x820C, size: 2, name: 'Generic Move Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x820D, size: 2, name: 'Generic Default Transition Time Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x820E, size: 2, name: 'Generic Default Transition Time Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x820F, size: 2, name: 'Generic Default Transition Time Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8210, size: 2, name: 'Generic Default Transition Time Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8211, size: 2, name: 'Generic OnPowerUp Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8212, size: 2, name: 'Generic OnPowerUp Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8213, size: 2, name: 'Generic OnPowerUp Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8214, size: 2, name: 'Generic OnPowerUp Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8215, size: 2, name: 'Generic Power Level Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8216, size: 2, name: 'Generic Power Level Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8217, size: 2, name: 'Generic Power Level Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8218, size: 2, name: 'Generic Power Level Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8219, size: 2, name: 'Generic Power Last Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x821A, size: 2, name: 'Generic Power Last Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x821B, size: 2, name: 'Generic Power Default Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x821C, size: 2, name: 'Generic Power Default Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x821D, size: 2, name: 'Generic Power Range Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x821E, size: 2, name: 'Generic Power Range Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x821F, size: 2, name: 'Generic Power Default Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8220, size: 2, name: 'Generic Power Default Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8221, size: 2, name: 'Generic Power Range Set', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8222, size: 2, name: 'Generic Power Range Set Unacknowledged', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8223, size: 2, name: 'Generic Battery Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8224, size: 2, name: 'Generic Battery Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8225, size: 2, name: 'Generic Location Global Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x40, size: 2, name: 'Generic Location Global Status', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8226, size: 2, name: 'Generic Location Local Get', TX_fct: null, RX_fct: null, callback: null},
{id: 0x8227, size: 2, name: 'Generic Location Local Status', TX_fct: null, RX_fct: null, callback: null},

//Generic Location Global Set 0x41
//Generic Location Global Set Unacknowledged 0x42
//Generic Location Local Set 0x82 0x28
//Generic Location Local Set Unacknowledged 0x82 0x29
//Generic Manufacturer Properties Get 0x82 0x2A
//Generic Manufacturer Properties Status 0x43
//Generic Manufacturer Property Get 0x82 0x2B
//Generic Manufacturer Property Set 0x44
//Generic Manufacturer Property Set Unacknowledged 0x45
//Generic Manufacturer Property Status 0x46
//Generic Admin Properties Get 0x82 0x2C
//Generic Admin Properties Status 0x47
//Generic Admin Property Get 0x82 0x2D
//Generic Admin Property Set 0x48
//Generic Admin Property Set Unacknowledged 0x49
//Generic Admin Property Status 0x4A
//Generic User Properties Get 0x82 0x2E
//Generic User Properties Status 0x4B
//Generic User Property Get 0x82 0x2F
//Generic User Property Set 0x4C
//Generic User Property Set Unacknowledged 0x4D
//Generic User Property Status 0x4E
//Generic Client Properties Get 0x4F
//Generic Client Properties Status 0x50
//Sensor Descriptor Get 0x82 0x30
//Sensor Descriptor Status 0x51
//Sensor Get 0x82 0x31
//Sensor Status 0x52
//Sensor Column Get 0x82 0x32
//Sensor Column Status 0x53
//Sensor Series Get 0x82 0x33
//Sensor Series Status 0x54
//Sensor Cadence Get 0x82 0x34
//Sensor Cadence Set 0x55
//Sensor Cadence Set Unacknowledged 0x56
//Sensor Cadence Status 0x57
//Sensor Settings Get 0x82 0x35
//Sensor Settings Status 0x58
//Sensor Setting Get 0x82 0x36
//Sensor Setting Set 0x59
//Sensor Setting Set Unacknowledged 0x5A
//Sensor Setting Status 0x5B
//Time Get 0x82 0x37
//Time Set 0x5C
//Time Status 0x5D
//Time Role Get 0x82 0x38
//Time Role Set 0x82 0x39
//Time Role Status 0x82 0x3A
//Time Zone Get 0x82 0x3B
//Time Zone Set 0x82 0x3C
//Time Zone Status 0x82 0x3D
//TAI-UTC Delta Get 0x82 0x3E
//TAI-UTC Delta Set 0x82 0x3F
//TAI-UTC Delta Status 0x82 0x40
//Scene Get 0x82 0x41
//Scene Recall 0x82 0x42
//Scene Recall Unacknowledged 0x82 0x43
//Scene Status 0x5E
//Scene Register Get 0x82 0x44
//Scene Register Status 0x82 0x45
//Scene Store 0x82 0x46
//Scene Store Unacknowledged 0x82 0x47
//Scene Delete 0x82 0x9E
//Scene Delete Unacknowledged 0x82 0x9F
//Scheduler Action Get 0x82 0x48
//Scheduler Action Status 0x5F
//Scheduler Get 0x82 0x49
//Scheduler Status 0x82 0x4A
//Scheduler Action Set 0x60
//Scheduler Action Set Unacknowledged 0x61
//Light Lightness Get 0x82 0x4B
//Light Lightness Set 0x82 0x4C
//Light Lightness Set Unacknowledged 0x82 0x4D
//Light Lightness Status 0x82 0x4E
//Light Lightness Linear Get 0x82 0x4F
//Light Lightness Linear Set 0x82 0x50
//Light Lightness Linear Set Unacknowledged 0x82 0x51
//Light Lightness Linear Status 0x82 0x52
//Light Lightness Last Get 0x82 0x53
//Light Lightness Last Status 0x82 0x54
//Light Lightness Default Get 0x82 0x55
//Light Lightness Default Status 0x82 0x56
//Light Lightness Range Get 0x82 0x57
//Light Lightness Range Status 0x82 0x58
//Light Lightness Default Set 0x82 0x59
//Light Lightness Default Set Unacknowledged 0x82 0x5A
//Light Lightness Range Set 0x82 0x5B
//Light Lightness Range Set Unacknowledged 0x82 0x5C
//Light CTL Get 0x82 0x5D
//Light CTL Set 0x82 0x5E
//Light CTL Set Unacknowledged 0x82 0x5F
//Light CTL Status 0x82 0x60
//Light CTL Temperature Get 0x82 0x61
//Light CTL Temperature Range Get 0x82 0x62
//Light CTL Temperature Range Status 0x82 0x63
//Light CTL Temperature Set 0x82 0x64
//Light CTL Temperature Set Unacknowledged 0x82 0x65
//Light CTL Temperature Status 0x82 0x66
//Light CTL Default Get 0x82 0x67
//Light CTL Default Status 0x82 0x68
//Light CTL Default Set 0x82 0x69
//Light CTL Default Set Unacknowledged 0x82 0x6A
//Light CTL Temperature Range Set 0x82 0x6B
//Light CTL Temperature Range Set Unacknowledged 0x82 0x6C
//Light HSL Get 0x82 0x6D
//Light HSL Hue Get 0x82 0x6E
//Light HSL Hue Set 0x82 0x6F
//Light HSL Hue Set Unacknowledged 0x82 0x70
//Light HSL Hue Status 0x82 0x71
//Light HSL Saturation Get 0x82 0x72
//Light HSL Saturation Set 0x82 0x73
//Light HSL Saturation Set Unacknowledged 0x82 0x74
//Light HSL Saturation Status 0x82 0x75
//Light HSL Set 0x82 0x76
//Light HSL Set Unacknowledged 0x82 0x77
//Light HSL Status 0x82 0x78
//Light HSL Target Get 0x82 0x79
//Light HSL Target Status 0x82 0x7A
//Light HSL Default Get 0x82 0x7B
//Light HSL Default Status 0x82 0x7C
//Light HSL Range Get 0x82 0x7D
//Light HSL Range Status 0x82 0x7E
//Light HSL Default Set 0x82 0x7F
//Light HSL Default Set Unacknowledged 0x82 0x80
//Light HSL Range Set 0x82 0x81
//Light HSL Range Set Unacknowledged 0x82
//Light xyL Get 0x82 0x83
//Light xyL Set 0x82 0x84
//Light xyL Set Unacknowledged 0x82 0x85
//Light xyL Status 0x82 0x86
//Light xyL Target Get 0x82 0x87
//Light xyL Target Status 0x82 0x88
//Light xyL Default Get 0x82 0x89
//Light xyL Default Status 0x82 0x8A
//Light xyL Range Get 0x82 0x8B
//Light xyL Range Status 0x82 0x8C
//Light xyL Default Set 0x82 0x8D
//Light xyL Default Set Unacknowledged 0x82 0x8E
//Light xyL Range Set 0x82 0x8F
//Light xyL Range Set Unacknowledged 0x82 0x90
//Light LC Mode Get 0x82 0x91
//Light LC Mode Set 0x82 0x92
//Light LC Mode Set Unacknowledged 0x82 0x93
//Light LC Mode Status 0x82 0x94
//Light LC OM Get 0x82 0x95
//Light LC OM Set 0x82 0x96
//Light LC OM Set Unacknowledged 0x82 0x97
//Light LC OM Status 0x82 0x98
//Light LC Light OnOff Get 0x82 0x99
//Light LC Light OnOff Set 0x82 0x9A
//Light LC Light OnOff Set Unacknowledged 0x82 0x9B
//Light LC Light OnOff Status 0x82 0x9C
//Light LC Property Get 0x82 0x9D
//Light LC Property Set 0x62
//Light LC Property Set Unacknowledged 0x63
//Light LC Property Status 0x64
];

// OPCODE.FindByName = function (opcode_name) {
//   var obj = OPCODE.find(function (obj) {
//     return obj.name == opcode_name;
//   });
//   return obj;
// };
// OPCODE.FindByID = function (id) {
//   var obj = OPCODE.find(function (obj) {
//     return obj.id == id;
//   });
//   return obj;
// };
//
// OPCODE.ToHexID = function (obj) {
//   return utils.toHex(obj.id, obj.size);
// };
