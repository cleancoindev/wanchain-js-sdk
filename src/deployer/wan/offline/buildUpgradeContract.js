const tool = require('../utils/tool');
const scTool = require('../utils/scTool');

async function buildUpgradeContract(walletId, path, typeArray) {
  let compiled, txData, serialized, output = [];

  try {
    let sender = await scTool.path2Address(walletId, path);
    let nonce = tool.getNonce(sender);
   
    if (typeArray.includes('lib')) {
      // upgrade HTLCDelegate
      compiled = scTool.compileContract('HTLCDelegate');
      scTool.linkContract(compiled, ['SchnorrVerifier', 'QuotaLib', 'HTLCLib', 'HTLCDebtLib', 'HTLCSmgLib', 'HTLCUserLib']);
      txData = await scTool.getDeployContractTxData(compiled);
      serialized = await scTool.serializeTx(txData, nonce++, '', '0', walletId, path);
      output.push({name: 'HTLCDelegate', data: serialized});
    } 

    let filePath = tool.getOutputPath('upgradeContract');
    tool.write2file(filePath, JSON.stringify(output));
    tool.logger.info("tx is serialized to %s", filePath);

    // update nonce
    tool.updateNonce(sender, nonce);

    return true;
  } catch (e) {
    tool.logger.error("buildUpgradeContract failed: %O", e);
    return false;
  }
}

module.exports = buildUpgradeContract;