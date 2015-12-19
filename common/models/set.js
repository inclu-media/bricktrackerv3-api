module.exports = function(Set) {
  Set.disableRemoteMethod('create', true);
  Set.disableRemoteMethod('upsert', true);
  Set.disableRemoteMethod('deleteById', true);
  Set.disableRemoteMethod("updateAll", true);
  Set.disableRemoteMethod("updateAttributes", false);
  Set.disableRemoteMethod('createChangeStream', true);
  Set.disableRemoteMethod('findById', true);
  Set.disableRemoteMethod('exists', true);
  Set.disableRemoteMethod('count', true);
};

