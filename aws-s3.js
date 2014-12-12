angular.module('aws.s3', [
  'aws'
]).factory('S3', function (
  $q,
  AWS
) {
  function S3 (config) {
    var self = this;
    var s3 = new AWS.S3(config);
    var methods = ['copyObject', 'deleteObject', 'deleteObjects',
                   'getObject', 'getSignedUrl', 'headObject',
                   'listObjects', 'listObjectVersions', 'listParts',
                   'putObject', 'putObjectAcl', 'restoreObject',
                   'upload', 'uploadPart', 'uploadPartCopy',
                   'createMultipartUpload'];

    function callbackToPromise (method, operation, params) {
      var deferred = $q.defer();

      var request;
      if (params) {
        request = s3[method](operation, params, callback);
      } else {
        request = s3[method](operation, callback);
      }

      request.on('httpUploadProgress', function (progress) {
        deferred.notify(progress);
      });

      function callback (error, data) {
        if (error) {
          deferred.reject(error);
        } else {
          deferred.resolve(data);
        }
      }

      return deferred.promise;
    }

    this.config = s3.config;
    this.methods = methods;
    methods.map(function (method) {
      self[method] = function (operation, params) {
        return callbackToPromise(method, operation, params);
      };
    });
  }

  return S3;
});
