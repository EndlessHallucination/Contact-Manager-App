import { Component, inject, OnInit } from '@angular/core';
import { ContactService } from '../services/contact.service';
import { MatAnchor, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-header',
  imports: [MatIconButton, MatIcon],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  contactService = inject(ContactService);

  ngOnInit(): void {
    this.contactService.isOk().subscribe();
  }

  onSyncClick() {
    this.contactService.syncContactTaskQueue()?.subscribe({
      error: err => console.error("Sync failed", err)
    });

  }
}
