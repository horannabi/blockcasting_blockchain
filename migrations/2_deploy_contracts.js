const BlockCastingWallet = artifacts.require('./BlockCastingWallet.sol')
const fs = require('fs')

module.exports = function (deployer) {
  deployer.deploy(BlockCastingWallet)
    .then(() => {
      if (BlockCastingWallet._json) {
        fs.writeFile(
          'deployedABI',
          JSON.stringify(BlockCastingWallet._json.abi),
          (err) => {
            if (err) throw err
            console.log("파일에 ABI 입력 성공");
          })
      }

      fs.writeFile(
        'deployedAddress',
        BlockCastingWallet.address,
        (err) => {
          if (err) throw err
          console.log("파일에 주소 입력 성공");
        })
    })
}