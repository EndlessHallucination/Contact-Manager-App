import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, tap, Observable, concat, zip, finalize, of, switchMap } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';

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

interface ContactTask {
  type: "create" | "delete" | "update";
  data: any;
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
  updates = inject(SwUpdate);

  cachedContactList = computed(() => this.contacts());
  isServerOnline = signal(false);
  contactTaskQueue = signal<ContactTask[]>([]);


  constructor() {
    const saved = localStorage.getItem("contact-task-queue");
    let parsed: any = [];
    try {
      parsed = JSON.parse(saved ?? '[]');
      if (!Array.isArray(parsed)) parsed = [];
    } catch {
      parsed = [];
    }
    this.contactTaskQueue.set(parsed);
    window.addEventListener("online", () => { this.isServerOnline.set(true) })
    window.addEventListener("offline", () => { this.isServerOnline.set(false) })


    window.addEventListener("online", () => {
      this.isOk().subscribe(ok => {
        if (this.isServerOnline()) {
          this.syncContactTaskQueue()?.subscribe(() => {
            console.log("Offline changes synced.");
          });
        }
      });
    });

  }

  addContactTask(task: ContactTask) {
    const updated = [...this.contactTaskQueue(), task];
    this.contactTaskQueue.set(updated);
    localStorage.setItem("contact-task-queue", JSON.stringify(updated));
  }



  syncContactTaskQueue() {
    const queue = this.contactTaskQueue();
    if (!queue.length) return of(null);

    return this.isOk().pipe(
      tap(ok => {
        if (!this.isServerOnline()) throw new Error("Server offline");
      }),
      switchMap(() => concat(...queue.map(t => this.executeTask(t)))),
      finalize(() => {
        this.contactTaskQueue.set([]);
        localStorage.setItem("contact-task-queue", JSON.stringify([]));
      })
    );
  }

  executeTask(task: ContactTask) {
    if (task.type === 'create') {
      return this.submitContactForm(task.data);
    }
    if (task.type === 'update') {
      return this.updateContact(task.data.id, task.data);
    }
    if (task.type === 'delete') {
      return this.deleteContact(task.data.id);
    }
    throw new Error()
  }

  isOk() {
    return this.http.get<{ ok: boolean }>(`${this.api}/is-ok`).pipe(
      tap({
        next: () => this.isServerOnline.set(true),
        error: () => this.isServerOnline.set(false)
      })
    );
  }

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
    if (!this.isServerOnline()) {
      this.addContactTask({ type: "create", data });
      return of(data as Contact);
    }
    return this.http.post<Contact>(`${this.api}/contacts/new`, data);
  }

  updateContact(id: number, data: any): Observable<Contact> {
    if (!this.isServerOnline()) {
      this.addContactTask({ type: "update", data: { ...data, id } });
      return of(data as Contact);
    }
    return this.http.put<Contact>(`${this.api}/contacts/${id}`, data);
  }

  deleteContact(id: number): Observable<any> {
    if (!this.isServerOnline()) {
      this.addContactTask({ type: "delete", data: { id } });
      this.contacts.set(this.contacts().filter(c => c.id !== id));
      return of(true);
    }
    return this.http.delete(`${this.api}/contacts/${id}`).pipe(
      tap(() => {
        this.contacts.set(this.contacts().filter(c => c.id !== id));
      })
    );
  }
}