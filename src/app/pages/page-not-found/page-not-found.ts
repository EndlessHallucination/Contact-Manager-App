import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatAnchor } from "@angular/material/button";

@Component({
  selector: 'app-page-not-found',
  imports: [MatAnchor],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css',
})
export class PageNotFound {

  router = inject(Router)

  goHome() {
    this.router.navigate(['/contacts']);

  }
}
