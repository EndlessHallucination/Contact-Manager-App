import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, tap, Observable } from 'rxjs';

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cell: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  age: number;
  image?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private api = 'http://localhost:3000/app';
  http = inject(HttpClient);
  isContactListLoading = signal(false);
  isContactDetailsLoading = signal(false);
  contacts = signal<Contact[]>([]);

  cachedContactList = computed(() => this.contacts());

  loadContactList(): Observable<Contact[]> {
    this.isContactListLoading.set(true);
    return this.http.get<Contact[]>(`${this.api}/contacts`).pipe(
      delay(500),
      tap((data) => {
        this.isContactListLoading.set(false);
        this.contacts.set(data);
      })
    );
  }

  getContactById(id: number): Observable<Contact> {
    this.isContactDetailsLoading.set(true);
    return this.http.get<Contact>(`${this.api}/contacts/${id}`).pipe(
      delay(500),
      tap(() => {
        this.isContactDetailsLoading.set(false);
      })
    );
  }

  getContactDetails(id: number): Observable<Contact> {
    return this.getContactById(id);
  }

  submitContactForm(data: any): Observable<Contact> {
    return this.http.post<Contact>(`${this.api}/contacts/new`, data);
  }

  updateContact(id: number, data: any): Observable<Contact> {
    return this.http.put<Contact>(`${this.api}/contacts/${id}`, data);
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.api}/contacts/${id}`).pipe(
      tap(() => {
        this.contacts.set(this.contacts().filter(c => c.id !== id));
      })
    );
  }
}
