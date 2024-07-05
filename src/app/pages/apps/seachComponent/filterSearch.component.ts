import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { SearchResultDTO } from 'src/app/DTOs/dtoIndex';
import { SearchService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-search',
  templateUrl: './filterSearch.component.html',
})
export class SearchComponent {
  searchControl = new FormControl('');
  results: SearchResultDTO[] = [];

  constructor(private searchService: SearchService,private router: Router) {
    this.searchControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter(query => query!.trim().length > 0), // Skip empty queries
      switchMap(query => this.searchService.search(query ?? "none"))
    ).subscribe(results => {
      console.log(results);
      this.results = results;
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(query => {
      if (!query?.trim()) {
        this.results = [];
      }
    });
  }

  selectResult(result: SearchResultDTO) {
    console.log(result);
    this.router.navigate(['apps/payment', result.accountId]);
  }
}
