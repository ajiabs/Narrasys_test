export class Versioner {
  private major: number;
  private minor: number;
  private patch: string | number;
  private devReleaseCount: any;
  private vNum: string[];
  private _patchBlob: any;
  private _releaseType: string;
  private _finalVersion: string;

  constructor(public versionTxt: string) {
    this.vNum = versionTxt.split('.');
    this.major = parseInt(this.vNum[0].slice(1), 10);
    this.minor = parseInt(this.vNum[1], 10);
    this._patchBlob = this.vNum[2];
  }

  get releaseType() {

    if (this._patchBlob.indexOf('-') > -1) {
      this._releaseType = 'DEVELOPMENT';
    } else {
      this._releaseType = 'PRODUCTION';
    }

    return this._releaseType;
  }

  get finalVersion() {
    return this._finalVersion;
  }

  devRelease(versionType: string) {
    if (this._patchBlob.indexOf('-') > -1) {
      const devReleaseBlob = this._patchBlob.split('-');

      this.patch = devReleaseBlob[0];
      //not the first or second dev release, our blob has a third element; i.e. the prior release num
      if (devReleaseBlob.length > 2) {
        this.devReleaseCount = parseInt(devReleaseBlob[2], 10);
        this.devReleaseCount += 1;
        //set final version
        this._finalVersion = `v${this.major}.${this.minor}.${this.patch}-dev-${this.devReleaseCount}`;
      } else {
        //second dev release; i.e.; from -dev to -dev-1;
        this._finalVersion = `v${this.major}.${this.minor}.${this.patch}-dev-1`;
      }
    } else {
      //patchBlob is just a number in this case
      this.patch = parseInt(this._patchBlob, 10);
      //increment the version num
      switch (versionType) {
        case 'MAJOR':
          this.major += 1;
          break;
        case 'MINOR':
          this.minor += 1;
          break;
        case 'PATCH':
          this.patch += 1;
          break;
      }
      //set final version
      this._finalVersion = `v${this.major}.${this.minor}.${this.patch}-dev`;
    }
  }

  productionRelease(): Promise<string> {
    //this is a production build,
    //if we have a dev tag or any sort, do not bump the production number
    //(we should only be able to get here from a dev build, so this should prob be default)

    return new Promise((resolve, reject) => {
      //confirm this is from a dev release
      if (this.releaseType === 'DEVELOPMENT') {

        //strip the dev tag from patch number;
        const stripDevBlob = this._patchBlob.split('-');
        this.patch = stripDevBlob[0];

        //set final version
        this._finalVersion = `v${this.major}.${this.minor}.${this.patch}`;
        return resolve(this._finalVersion);
      } else {
        return reject('production builds must come from dev releases');
      }
    });

  }
}
