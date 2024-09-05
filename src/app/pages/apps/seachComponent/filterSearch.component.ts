import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { BuildingAccountSearchResultDTO } from 'src/app/DTOs/dtoIndex';
import { SearchService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-search',
  templateUrl: './filterSearch.component.html',
})
export class SearchComponent implements OnInit {
  @Input() searchType: string = '';  // Input property to receive string value
  searchControl = new FormControl('');
  results: BuildingAccountSearchResultDTO[] = [];

  constructor(private searchService: SearchService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.searchType = data['searchType'] || '';  // Fallback to empty string if not provided
    });
    this.searchControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter(query => query!.trim().length > 0), // Skip empty queries
      switchMap(query => this.searchService.searchBuildingAccount(query ?? "none"))
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

  selectResult(result: BuildingAccountSearchResultDTO) {
    console.log(result);
    switch(this.searchType) {
      case 'badDept':
        this.router.navigate(['apps/badDept', result.accountId]);
        break;
      case 'statement':
        this.router.navigate(['apps/statement', result.accountId]);
        break;
      // Add more cases here based on different search types
      default:
        console.warn('Unknown search type:', this.searchType);
        break;
    }
  }
}
