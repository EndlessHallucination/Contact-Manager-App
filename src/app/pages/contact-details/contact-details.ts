import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Contact, ContactService } from '../../services/contact.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-contact-detail',
  imports: [MatButton, CommonModule, MatProgressSpinnerModule],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.css'
})
export class ContactDetail implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  contactService = inject(ContactService);

  contact = signal<Contact | undefined>(undefined);
  isNewContact = signal(false);
  isLoading = signal(false);
  id: number | null = null;

  ngOnInit() {
    this.isLoading.set(true);

    if (this.contactService.contacts().length > 0) {
      this.initializeContact();
      return;
    }

    this.contactService.loadContactList().subscribe({
      next: () => this.initializeContact(),
      error: () => {
        alert('Error loading contact list');
        this.isLoading.set(false);
      }
    });
  }

  initializeContact() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam === 'new') {
      this.isNewContact.set(true);
      this.isLoading.set(false);
      return;
    }

    const id = Number(idParam);
    const found = this.contactService.contacts().find(c => c.id === id);

    if (!found) {
      alert('Contact not found');
      this.isLoading.set(false);
      return;
    }

    this.loadContact(id)?.subscribe({ next: () => this.isLoading.set(false), error: () => this.isLoading.set(false) });
  }

  loadContact(id: number) {
    this.contact.set(undefined);
    return this.contactService.getContactById(id).pipe(
      tap({
        next: (data) => {
          this.contact.set(data);
          this.id = data.id;
        },
        error: () => alert('Error loading contact details')
      })
    );
  }

  onEditClick() {
    if (this.id) this.router.navigate(['/contacts', this.id, 'edit']);
  }

  onDeleteClick() {
    if (!this.id) return;
    if (!confirm('Delete this contact?')) return;

    this.contactService.deleteContact(this.id).subscribe({
      next: () => this.router.navigate(['/contacts']),
      error: () => alert('Error deleting contact')
    });
  }

  onCancelClick() {
    this.router.navigate(['/contacts']);
  }

  getFormattedDate(date: string) {
    return new Date(date).toLocaleDateString();
  }
}
