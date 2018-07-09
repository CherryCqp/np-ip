var ipAddr = exports;
//是否是私网地址
ipAddr.isPrivateIP = function(addr) {

    let  isInnerIp = /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i
                      .test(addr) ||
                    /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
                    /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i
                      .test(addr) ||
                    /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
                    /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
                    /^f[cd][0-9a-f]{2}:/i.test(addr) ||
                    /^fe80:/i.test(addr) ||
                    /^::1$/.test(addr) ||
                    /^::$/.test(addr);
  
    return isInnerIp;
  }
  
  //是否是公网地址
  ipAddr.isPublicIP = function(addr) {
    return !ipAddr.isPrivateIP(addr);
  }
  
  //是否是有效IP地址
  ipAddr.isValidIP = function(ip) {
    let reg =  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return reg.test(ip);
  }
  
  //子网掩码验证
  ipAddr.isCidr = function( network, mask) {
    let subnet = {
      available:false,
      isValidIP:false,
      isValidMask:false,
      isPrivateIP:false,
      isPublicIP:false,
    };
    mask = parseInt(mask);
    if(ipAddr.isValidIP(network)){
      subnet.isValidIP = true;
      if(ipAddr.isPrivateIP(network)){
        subnet.isPrivateIP = true
      }else{
        subnet.isPublicIP = true
      }
    }
    if(mask>=0 && mask<=32){
      subnet.isValidMask = true;
    }
    if(subnet.isValidIP && subnet.isValidMask){
      let networkArr = network.split('.');
      let net = (parseInt(networkArr[0])<<24>>>0) + (parseInt(networkArr[1])<<16>>>0) + (parseInt(networkArr[2])<<8>>>0) + (parseInt(networkArr[3]));
      let maskArr = [0, 2147483648, 3221225472, 3758096384, 4026531840, 4160749568, 4227858432, 4261412864, 4278190080, 4286578688, 4290772992, 4292870144, 4293918720, 4294443008, 4294705152, 4294836224, 4294901760, 4294934528, 4294950912, 4294959104, 4294963200, 4294965248, 4294966272, 4294966784, 4294967040, 4294967168, 4294967232, 4294967264, 4294967280, 4294967288, 4294967292, 4294967294, 4294967295];
      if((net&maskArr[mask])>>>0 === net){
          subnet.available =  true;
      }
    }
    return subnet;
  }
  
  //将地址转化为整数地址
  ipAddr.toLong = function(ip) {
    var ipl = 0;
    ip.split('.').forEach(function(octet) {
      ipl <<= 8;
      ipl += parseInt(octet);
    });
    return(ipl >>> 0);
  }
  
  //将整数地址转化为‘.‘分割地址
  ipAddr.fromLong = function(ipl) {
    return ((ipl >>> 24) + '.' +
        (ipl >> 16 & 255) + '.' +
        (ipl >> 8 & 255) + '.' +
        (ipl & 255) );
  }
  
  //十进制转32位二进制
  ipAddr.binary = function(num) {
    let Binary = num.toString(2);
    let len = 32-Binary.length;
  
    for(let i = 0; i < len; i++){
      Binary = '0'+Binary;
    }
    return Binary;
  }
  
  //获取相关地址：网络地址、广播地址等
  ipAddr.subnet = function( network, mask) {
  
    let msg = {
      isValidIP:false,
      isValidMask:false,
      contains:null,            
      subnet:{
        internetAddr:'',
        broadcastAddr:'',
        firstAddr:'',
        lastAddr:'',
        subnetMask:'',
        hostNum:0,
        length:0,
      }}
      
  
    if(ipAddr.isValidIP(network)){
      msg.isValidIP = true;
    }
  
    if(mask>=0 && mask<=32){
      msg.isValidMask = true;
    }
  
    if(msg.isValidIP && msg.isValidMask){
  
      let m = mask;
      let maskBuf = Buffer.alloc(32);
  
      for(var i = 0;i < m;i++){
          maskBuf[i] = 1;
      }
  
      let formatMask = [];
      for(var i =0;i <32;i+=8){
        let b=[];
        for(var j = 0;j<8;j++){
          b.push(maskBuf[i+j]);
        }
        formatMask.push(parseInt(parseInt(b.join('').toString()),2));
      }
  
      let newMask = ipAddr.toLong(formatMask.join('.'));
      let newNet = ipAddr.toLong(network);
      let newResult = (newNet&newMask)>>>0;
  
      msg.subnet.internetAddr = ipAddr.fromLong(newResult);
      msg.subnet.broadcastAddr = ipAddr.fromLong((newNet|(~newMask)&parseInt('ffffffff',16))>>>0);
      msg.subnet.firstAddr = mask<32 ? ipAddr.fromLong(newResult+1) : msg.subnet.internetAddr;
      msg.subnet.lastAddr = mask<32 ? ipAddr.fromLong(((newNet|(~newMask)&parseInt('ffffffff',16))>>>0) - 1) : msg.subnet.internetAddr;
      msg.subnet.subnetMask = formatMask.join('.');
      msg.subnet.hostNum = mask<32 ? Math.pow(2,32-mask)-2:1;
      msg.subnet.length = Math.pow(2,32-mask);
      msg.contains = function(addr){
        return (ipAddr.toLong(network)>>(32-mask)>>>0) === (ipAddr.toLong(addr)>>(32-mask)>>>0);
      }
  
    }
  
    return msg;
  
  }
  
  //检查是否在网络地址范围之内
  ipAddr.checkRange = function( ip, mask, checkip){
    let msg = {
      isValidIP:false,
      isValidMask:false,
      isInRange:false
    };
  
    if(ipAddr.isValidIP(ip) && ipAddr.isValidIP(checkip)){
      msg.isValidIP = true;
    }
  
    if(mask>=0 && mask<=32){
      msg.isValidMask = true;
    }
  
    if(msg.isValidIP && msg.isValidMask){
      msg.isInRange = ((ipAddr.toLong(ip)>>(32-mask)>>>0) === (ipAddr.toLong(checkip)>>(32-mask)>>>0));
    }
  
    return msg;
  }
  
  //检查为ABCDE哪类地址
  ipAddr.checkIpType = function(ip){
    let msg = {
      isValidIP:false,
      type:''
    };
    let netip = ip.split('.');
  
    if(ipAddr.isValidIP(ip)){
      msg.isValidIP = true;
    }
  
    if(msg.isValidIP){
      switch(true)
      {
        case (parseInt(netip[0])>0 && parseInt(netip[0])<128):
          msg.type = 'A';
          break;
        case (parseInt(netip[0])>127 && parseInt(netip[0])<192):
          msg.type = 'B';
          break;
        case (parseInt(netip[0])>191 && parseInt(netip[0])<224):
          msg.type = 'C';
          break;
        case (parseInt(netip[0])>223 && parseInt(netip[0])<240):
          msg.type = 'D';
          break;
        default:
          msg.type = 'E';
          break;
      }
    }
  
    return msg;
  }
  
  
