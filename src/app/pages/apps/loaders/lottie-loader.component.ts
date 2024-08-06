import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { LoaderService } from 'src/app/services/lottieLoader.service';

@Component({
  selector: 'app-lottie-loader',
  templateUrl: './lottie-loader.component.html',
  styleUrls: ['./lottie-loader.component.css']
})
export class LottieLoaderComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/loaders/loader.json', // Path to your animation file
  };
  loading = false;

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.loaderService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }
}
