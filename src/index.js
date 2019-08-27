import Caver from "caver-js";
import {Spinner} from 'spin.js';


const config = {
  rpcURL: 'https://api.baobab.klaytn.net:8651'
}
const cav = new Caver(config.rpcURL);
const agContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);

const App = {
  auth: {
    accessType: 'keystore',
    keystore: '',
    password: ''
  },

  start: async function () {
    const walletFromSession = sessionStorage.getItem('walletInstance');
    if (walletFromSession) {
      try {
        cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
        this.changeUI(JSON.parse(walletFromSession));
      } catch (e) {      
        sessionStorage.removeItem('walletInstance');
      }
    }else{
      $('#loginWalletModal').modal('show');
      
        $('#loginWalletModal').on('hidden.bs.modal', function () {
          if (sessionStorage.getItem('walletInstance')==null) {
          $('#loginWalletModal').modal('show');
        }
         })
        
    }
  },

 

  handleImport: async function () {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);
    fileReader.onload = (event) => {      
      try {     
        if (!this.checkValidKeystore(event.target.result)) {
          $('#message').text('유효하지 않은 keystore 파일입니다.');
          return;
        }    
        this.auth.keystore = event.target.result;
        $('#message').text('유효한 keystore 파일입니다. 비밀번호를 입력하세요.');
        document.querySelector('#input-password').focus();    
      } catch (event) {
        $('#message').text('유효하지 않은 keystore 파일입니다.');
        return;
      }
    }   
  },

  handlePassword: async function () {
    this.auth.password = event.target.value;
  },

  handleLogin: async function () {
    if (this.auth.accessType === 'keystore') { 
      try {
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        console.log("privatekey"+privateKey)
        this.integrateWallet(privateKey);
      } catch (e) {      
        $('#message').text('비밀번호가 일치하지 않습니다.');
      }
    }
  },

  handleLogout: async function () {
    this.removeWallet();
    location.reload();
  },



  deposit: async function () {
    var spinner = this.showSpinner();
    const walletInstance = this.getWallet();

    if (walletInstance) {
     // if (await this.callOwner() !== walletInstance.address) return; 
     //if ((await this.callOwner()).toLowerCase() !== walletInstance.address.toLowerCase()) return; 
      //else {
        var amount = $('#amount').val();
        if (amount) {
          agContract.methods.deposit().send({
            from: walletInstance.address,
            gas: '250000',
            value: cav.utils.toPeb(amount, "KLAY")
          })        
          .once('transactionHash', (txHash) => {
            console.log(`txHash: ${txHash}`);
          })
          .once('receipt', (receipt) => {
            console.log(`(#${receipt.transactionHash})`, receipt); //Received receipt! It means your transaction(calling plus function) is in klaytn block                          
            spinner.stop();  
            alert(amount + " KLAY를 컨트랙에 송금했습니다.");               
            //location.reload();      
          
          })
          .once('error', (error) => {
            alert(error.message);
          }); 
        }
        return;    
     // }
    }
  },

  sendfnc: async function () {
    var spinner = this.showSpinner();
    const walletInstance = this.getWallet();
  
    if (walletInstance) {
        //receiver = $('#receiver').val();
        amount = $('#amount').val();
        
        if (amount && getParam("receiverAddress")) {
          agContract.methods.deposit().send({
            from: walletInstance.address,
            gas: '250000',
            value: cav.utils.toPeb(amount, "KLAY")
          })        
          .once('transactionHash', (txHash) => {
            console.log(`txHash: ${txHash}`);
          
            
          })
          .once('receipt', (receipt) => {
            console.log(`(#${receipt.transactionHash})`, receipt); //Received receipt! It means your transaction(calling plus function) is in klaytn block                          
            spinner.stop();  
            swal(amount + " KLAY를 컨트랙에 송금했습니다.", "", "success");
            console.log(receipt);              
            //location.reload();
            txHashSend = receipt.transactionHash;
            console.log("sendfnc txHashSend="+txHashSend);
            console.log("amount="+receipt.value)
            //this.receiverfnc();
            addSendKlaytnTx();   
          })
          .once('error', (error) => {
            
            alert(error.message);
          }); 
          
        }

        
        return;    
      
    }
  },

  receiverfnc: async function () {
    
    const walletInstance = this.getWallet();
    if (!walletInstance ){
      swal("지갑 계정에 로그인해주세요.", "", "error");
      return;
    }else if(walletInstance.address != getParam("receiverAddress")){
      swal("입금 받을 지갑 주소를 확인해주세요.", "", "error");
      handleLogout();
      return;
    }   
    var spinner = this.showSpinner();
    amount = getParam("txAmount")
    //console.log("리시버 들어옴"+receiver);
  
    agContract.methods.transfer(cav.utils.toPeb(amount, "KLAY")).send({
      //from: walletInstance.address,
      from: walletInstance.address,
      gas: '250000'
    }).then(function (receipt) {
      if (receipt.status) {
        spinner.stop();  
        swal(amount+" KLAY가 " + getParam("receiverAddress") + " 계정으로 지급되었습니다.", "", "success");    
        // $('#transaction').html("");
        // $('#transaction').append(`<p><a href='https://baobab.klaytnscope.com/tx/${receipt.transactionHash}' target='_blank'>클레이튼 Scope에서 트랜젝션 확인</a></p>`);
        txHashReceive = receipt.transactionHash;
        
        console.log(receipt.transactionHash);
        console.log(receipt);
        return agContract.methods.getBalance().call()
          .then(function (balance) {
            $('#contractBalance').html("");
            console.log('잔액: ' + cav.utils.fromPeb(balance, "KLAY") + ' KLAY');           
            updateKlaytnTx();
          });        
      }
    });   
  },

  callOwner: async function () {
    return await agContract.methods.owner().call();
  },

  callContractBalance: async function () {
    return await agContract.methods.getBalance().call();
  },

  getWallet: function () {
    if (cav.klay.accounts.wallet.length) {
      return cav.klay.accounts.wallet[0];
    }
  },

  checkValidKeystore: function (keystore) {
    const parsedKeystore = JSON.parse(keystore);
    const isValidKeystore = parsedKeystore.version &&
      parsedKeystore.id &&
      parsedKeystore.address &&
      parsedKeystore.crypto;  

    return isValidKeystore;
  },

  integrateWallet: function (privateKey) {
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance)
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
    klaytnAddress = walletInstance.address.toLowerCase();
    if(txType == 'R'){
      this.receiverfnc();
    }else{
      updateMyWalletAddress();
      this.changeUI(walletInstance);  
    }
    
  },

  reset: function () {
    this.auth = {
      keystore: '',
      password: ''
    };
  },

  changeUI: async function (walletInstance) {
    $('#loginWalletModal').modal('hide');
    $("#login").hide(); 
    $('#logout').show();
    $('#game').show();
   //$('#address').append('<br>' + '<p>' + '내 계정 주소: ' + walletInstance.address + '</p>');   
    //$('#contractBalance').append('<p>' + '이벤트 잔액: ' + cav.utils.fromPeb(await this.callContractBalance(), "KLAY") + ' KLAY' + '</p>');     
    //klaytnAddress = walletInstance.address.toLowerCase();
    
    console.log("나는 owner: "+(await this.callOwner()).toLowerCase());    
    console.log("내 주소: "+walletInstance.address.toLowerCase());  
    if ((await this.callOwner()).toLowerCase() === walletInstance.address.toLowerCase()) {
      $("#owner").show();   
    }     
  },

  removeWallet: function () {
    cav.klay.accounts.wallet.clear();
    sessionStorage.removeItem('walletInstance');
    this.reset();
  },

  showSpinner: function () {
    var target = document.getElementById('spin');
    return new Spinner(opts).spin(target);
  },

   

  receiveKlay: function() {
    var spinner = this.showSpinner();
    const walletInstance = this.getWallet();

    

    agContract.methods.transfer(cav.utils.toPeb("0.1", "KLAY")).send({
      from: walletInstance.address,
      gas: '250000'
    }).then(function (receipt) {
      if (receipt.status) {
        spinner.stop();  
        alert("0.1 KLAY가 " + walletInstance.address + " 계정으로 지급되었습니다.");      
        $('#transaction').html("");
        $('#transaction').append(`<p><a href='https://baobab.klaytnscope.com/tx/${receipt.transactionHash}' target='_blank'>클레이튼 Scope에서 트랜젝션 확인</a></p>`);
        alert(receipt.transactionHash);
        console.log(receipt);
        return agContract.methods.getBalance().call()
          .then(function (balance) {
            $('#contractBalance').html("");
            $('#contractBalance').append('<p>' + '이벤트 잔액: ' + cav.utils.fromPeb(balance, "KLAY") + ' KLAY' + '</p>');           
        });        
      }
    });      
  }  
};

window.App = App;

window.addEventListener("load", function () { 
  App.start();
});

var opts = {
  lines: 10, // The number of lines to draw
  length: 30, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#5bc0de', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};









