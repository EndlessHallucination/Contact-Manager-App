import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-list',
  imports: [
    MatIconModule,
    MatButton,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css'
})
export class ContactList implements OnInit {
  contactService = inject(ContactService);
  router = inject(Router);

  isLoadingRandomContacts = signal(false);

  searchTerm = signal('');

  sortedContacts = computed(() => {
    const list = [...this.contactService.cachedContactList()];
    return list.sort((a, b) =>
      (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
    );
  });

  filteredContacts = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.sortedContacts().filter(c =>
      (c.firstName + ' ' + c.lastName).toLowerCase().includes(search)
    );
  });

  contactCount = computed(() => this.filteredContacts().length);


  get isLoading() {
    return this.contactService.isContactListLoading();
  }

  ngOnInit(): void {
    this.contactService.loadContactList().subscribe({
      next: () => { },
      error: (error) => {
        console.error('Error loading contact list:', error);
        alert('Error loading contact list');
      }
    });
  }

  onNewContactClick() {
    this.router.navigate(['/contacts/new']);
  }

  async onAddRandomContactsClick() {
    this.isLoadingRandomContacts.set(true);
    // TODO: implement random contacts logic
    this.isLoadingRandomContacts.set(false);
  }

  onContactClick(id: number) {
    this.router.navigate(['/contacts', id]);
  }

  getFullAddress(contact: any): string {
    return `${contact.street}, ${contact.city}, ${contact.state} ${contact.postalCode}, ${contact.country}`;
  }
}