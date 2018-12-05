import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

 export class DishdetailComponent implements OnInit {

  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;

  commentForm: FormGroup;
  comment: Comment;
  @ViewChild('cform') commentFormDirective;

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cfb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { this.createForm(); }   // test moving create.Form to ngOnInit()

    formErrors = {
      'author': '',
      'rating': 5,
      'comment': ''
    };
  
    validationComments = {
      'author': {
        'required': 'Name is required.',
        'minlength': 'Name must be 2 or more chars long.',
        'maxlength': 'Name cannot be more than 25 chars long.'
      },
      'comment': {
        'required': 'Comment is required.'
      },
    };


  ngOnInit() {
    //this.createForm();   // might add to fix bug from Week3 Assignment + delete same from constructor above

    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess);
  } 

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];    
  }
  
  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.cfb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: [5],
      comment: ['', [Validators.required]] 
    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();  //reset form validation messages
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error msg, if any
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationComments[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    
    const comment = this.commentForm.value;

    this.dish.comments.push({ ...comment, date: new Date().toISOString() });

    this.commentFormDirective.resetForm();

    this.commentForm.reset({
      comment: '',
      rating: 5,
      author: ''
    });
  }
  
}
