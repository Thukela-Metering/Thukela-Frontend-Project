import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly DONT_ASK_AGAIN_KEY = 'dontAskAgainDownload';

  setDontAskAgainDownload(value: boolean): void {
    localStorage.setItem(this.DONT_ASK_AGAIN_KEY, JSON.stringify(value));
  }

  getDontAskAgainDownload(): boolean {
    return JSON.parse(localStorage.getItem(this.DONT_ASK_AGAIN_KEY) || 'false');
  }
}
