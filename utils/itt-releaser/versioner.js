/**
 * Created by githop on 1/31/16.
 */
'use strict';

const versioner = versionTxt => {
  //need to parse the version number to figure out how to bump it
  let vNum = versionTxt.split('.');
  //get rid of 'v' from major
  let major = parseInt(vNum[0].slice(1), 10);
  let minor = parseInt(vNum[1], 10);
  let patch;
  let devReleaseCount;
  let finalVersion;
  let releaseType;
  let _versionType;

  //patch blob is just a number for release builds, but could contain
  //-dev or -dev-n if it is a development release
  let patchBlob = vNum[2];

  function getReleaseType(skipCalc) {

    if (skipCalc === true) {
      return releaseType;
    }

    if (patchBlob.indexOf('-') > -1) {
      releaseType = 'DEVELOPMENT';
    } else {
      releaseType = 'PRODUCTION';
    }

    return releaseType;
  }

  function getVersionType() {
    return _versionType;
  }

  function getFinalVersion() {
    return finalVersion;
  }

  function devRelease(versionType) {
    if (patchBlob.indexOf('-') > -1) {
      var devReleaseBlob = patchBlob.split('-');

      patch = devReleaseBlob[0];
      //not the first or second dev release, our blob has a third element; i.e. the prior release num
      if (devReleaseBlob.length > 2) {
        devReleaseCount = parseInt(devReleaseBlob[2]);
        devReleaseCount++;
        //set final version
        finalVersion = `v${major}.${minor}.${patch}-dev-${devReleaseCount}`;
      } else {
        //second dev release; i.e.; from -dev to -dev-1;
        finalVersion = `v${major}.${minor}.${patch}-dev-1`;
      }
    } else {
      //patchBlob is just a number in this case
      patch = parseInt(patchBlob, 10);
      //increment the version num
      switch (versionType) {
        case 'MAJOR':
          major++;
          break;
        case 'MINOR':
          minor++;
          break;
        case 'PATCH':
          patch++;
          break;
      }
      _versionType = versionType;
      //set final version
      finalVersion = `v${major}.${minor}.${patch}-dev`;
    }
  }

  function productionRelease() {
    //this is a production build,
    //if we have a dev tag or any sort, do not bump the production number
    //(we should only be able to get here from a dev build, so this should prob be default)

    //confirm this is from a dev release
    if (patchBlob.indexOf('-') > -1) {

      //strip the dev tag from patch number;
      var stripDevBlob = patchBlob.split('-');
      patch = stripDevBlob[0];

      //set final version
      finalVersion = `v${major}.${minor}.${patch}`;
    } else {
      throw new Error('production builds must come from dev releases');
    }

  }

  function lastProductionRelease() {
    let [_maj, _min, _patch] = [major, minor, patch];
    switch (_versionType) {
      case 'MAJOR':
        _maj = major - 1;
        break;
      case 'MINOR':
        _min = minor - 1;
        break;
      case 'PATCH':
        _patch = patch - 1;
        break;
    }

    return `v${_maj}.${_min}.${_patch}`;
  }


  return {getVersionType, lastProductionRelease, getReleaseType, getFinalVersion, devRelease, productionRelease}

};

module.exports = versioner;
