import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { map } from 'rxjs/operators';
import { Statistic } from 'src/app/interfaces/statistic.entity';
import { User } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { StatisticService } from 'src/app/services/statistic.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-statistics',
  templateUrl: './user-statistics.component.html',
  styleUrls: ['./user-statistics.component.css'],
})
export class UserStatisticsComponent implements OnInit {
  @Input() stats: Statistic;
  fetchedStats: Statistic;

  constructor(private statisticService: StatisticService) {}

  ngOnInit(): void {
    // console.log('stats:', this.stats); // ? debug
    if (!this.stats) {
      this.statisticService.getWithMeta().subscribe({
        next: (data: Statistic) => {
          this.fetchedStats = data;
          // console.log('fetchedStats:', this.fetchedStats); // ? debug
        },
        error: (e) => console.error(e),
        // complete: () => console.info('Completed fetching stats'), // ? debug
      });
    }
  }
}
